---
title: "大文件上传和下载问题"
description: "大文件上传下载笔记，整理切片上传的基本术语、示例代码和优化方向。"
date: "2025-03-17T13:17:45+08:00"
draft: false
showHeroImage: false
tags:
  - 前端
  - 文件上传
  - 网络
  - 性能优化
categories:
  - 前端
series:
  - 前端性能优化
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---

> [!abstract]+ 问题预设
> 网络断开之后，之前上传的部分没了？
>
> 传着传着，网络波动了，结果没有了。
>
> 关机后可不可以接着传，怎么做到？

### 术语

- **断点续传**
- **断开重连重传**
- **切片上传**

## 切片上传

**步骤**

1. 前端切片 chunk 5MB
2. 将切片传递给后端，切片要去名：hash、index
3. 后端组合切片

### 代码示例

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>大文件上传</title>
  </head>

  <body>
    <input type="file" id="file" multiple />
    <button id="upload">上传</button>
  </body>

  <script>
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    function uploadFile() {
      const file = document.getElementById("file").files[0];
      console.log("上传文件", file.name);
      if (!file) {
        return;
      }

      const totalSize = file.size;
      const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);
      let currentChunk = 0;
      const chunks = [];

      function uploadChunk() {
        console.log("上传第", currentChunk, "块");
        if (currentChunk >= totalChunks) {
          console.log("上传完成");
          return;
        }
        const start = currentChunk * CHUNK_SIZE;
        const end = Math.min(totalSize, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("index", currentChunk);
        formData.append("totalChunks", totalChunks);
        formData.append("filename", file.name);

        // fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData
        // }).then(res => {
        //   if (res.ok) {
        //     currentChunk++;
        //     uploadChunk() // 递归上传下一块
        //   } else {
        //     throw new Error('上传失败')
        //   }
        // }).catch(err => {
        //   console.error(err)
        // });

        currentChunk++;
        uploadChunk(); // 递归上传下一块
      }

      // 开始上传
      uploadChunk();
    }

    document.getElementById("upload").addEventListener("click", uploadFile);
  </script>
</html>
```

### 优化

#### 压缩文件

上传前对文件进行压缩，减少传输的数据量。

`canvas`或第三方库压缩图片、`pako`压缩其他文件类型。

#### 并发上传

使用`Promise.all`并发上传多个分片。

注意控制并发数，避免请求过多。

```js
function uploadFile(file) {
  const chunkSize = 5 * 1024 * 1024; // 5MB
  const chunks = Math.ceil(file.size / chunkSize);
  const concurrency = 3; // 并发数
  let currentChunk = 0;

  function uploadChunk(index) {
    const offset = index * chunkSize;
    const chunk = file.slice(offset, offset + chunkSize);
    const formData = new FormData();
    formData.append("file", chunk);
    formData.append("offset", offset);
    formData.append("totalSize", file.size);

    return fetch("/upload", {
      method: "POST",
      body: formData,
    });
  }

  function uploadNextChunk() {
    if (currentChunk >= chunks) {
      console.log("Upload complete");
      return;
    }

    const promises = [];
    for (let i = 0; i < concurrency && currentChunk < chunks; i++) {
      promises.push(uploadChunk(currentChunk));
      currentChunk++;
    }

    Promise.all(promises).then(() => {
      uploadNextChunk();
    });
  }

  uploadNextChunk();
}
```

#### 显示上传进度

`websocket`实时通知上传情况，以及请求序列的控制。

通过`XMLHttpRequest`或`fetch`的 API 显示上传进度，提升用户体验。

```js
function uploadFile(file) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      console.log(`Upload progress: ${percentComplete}%`);
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      console.log("Upload complete");
    }
  };

  const formData = new FormData();
  formData.append("file", file);
  xhr.send(formData);
}
```

#### 主进程卡顿？

尝试使用`web-worker`，实现多线程切片，处理完之后交给主进程发送

#### 实现用户关闭浏览器后重新打开，继续上传

将 `Blob` 存储到`IndexedDB`，下次打开浏览器后嗅探一下是否存在未完成的切片，如果有就尝试继续上传。

记录已上传的分片信息。

上传前检查服务器上已上传的分片，跳过已上传部分。

## 下载

### 合并分片的文件

将大文件分成多个小块下载，减少单次请求的压力，并支持断点续传。

**步骤**

- 服务器将文件分片，前端通过多个请求下载分片。
- 使用  `Range`  请求头指定下载范围。
- 前端将分片合并为完整文件。

#### 代码示例

```js
async function downloadFile(url, fileName, chunkSize = 5 * 1024 * 1024) {
  let offset = 0;
  const chunks = [];

  while (true) {
    const end = offset + chunkSize - 1;
    const headers = { Range: `bytes=${offset}-${end}` };
    const response = await fetch(url, { headers });

    if (response.status === 206) {
      // 206 Partial Content
      const blob = await response.blob();
      chunks.push(blob);
      offset += chunkSize;
    } else if (response.status === 200) {
      // 如果服务器不支持分片下载，直接下载整个文件
      const blob = await response.blob();
      chunks.push(blob);
      break;
    } else {
      throw new Error("Failed to download file");
    }
  }

  // 合并分片
  const fullBlob = new Blob(chunks);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(fullBlob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 使用
downloadFile("https://example.com/large-file.zip", "large-file.zip");
```

### 流式下载

使用流式 API（如  `ReadableStream`）逐步下载文件，避免内存占用过高。

**实现步骤：**

- 使用  `fetch`  获取响应流。
- 通过  `ReadableStream`  逐步读取数据并写入文件。

#### 代码示例

```js
async function streamDownload(url, fileName) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // 合并数据
  const fullBlob = new Blob(chunks);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(fullBlob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 使用
streamDownload("https://example.com/large-file.zip", "large-file.zip");
```

### 断点续传（Resumable Download）

在网络中断后，从中断处继续下载，避免重新下载。

**实现步骤：**

- 记录已下载的字节范围。
- 使用  `Range`  请求头从断点处继续下载。

#### 代码示例

```js
async function resumeDownload(url, fileName, chunkSize = 5 * 1024 * 1024) {
  let offset = 0;
  const chunks = [];

  // 检查本地是否有部分下载的文件
  const savedBlob = localStorage.getItem(fileName);
  if (savedBlob) {
    const blob = new Blob([savedBlob]);
    offset = blob.size;
    chunks.push(blob);
  }

  while (true) {
    const end = offset + chunkSize - 1;
    const headers = { Range: `bytes=${offset}-${end}` };
    const response = await fetch(url, { headers });

    if (response.status === 206) {
      // 206 Partial Content
      const blob = await response.blob();
      chunks.push(blob);
      offset += chunkSize;

      // 保存已下载的部分到本地
      const fullBlob = new Blob(chunks);
      localStorage.setItem(fileName, await fullBlob.text());
    } else if (response.status === 200) {
      // 如果服务器不支持分片下载，直接下载整个文件
      const blob = await response.blob();
      chunks.push(blob);
      break;
    } else {
      throw new Error("Failed to download file");
    }
  }

  // 合并分片
  const fullBlob = new Blob(chunks);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(fullBlob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
  localStorage.removeItem(fileName);
}

// 使用
resumeDownload("https://example.com/large-file.zip", "large-file.zip");
```

### 其他优化

1. **Service Worker 缓存**：通过 Service Worker 缓存大文件，提升后续加载速度。。
2. **显示下载进度**：提升用户体验。
