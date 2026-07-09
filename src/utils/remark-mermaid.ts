type MdastNode = {
  type?: string;
  lang?: string | null;
  value?: string;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    hChildren?: unknown[];
  };
  children?: MdastNode[];
};

function isMermaidCode(node: MdastNode) {
  return node.type === 'code' && node.lang?.toLowerCase() === 'mermaid';
}

function visit(node?: MdastNode) {
  if (!node) return;

  if (isMermaidCode(node)) {
    const source = node.value ?? '';

    node.type = 'paragraph';
    node.data = {
      hName: 'figure',
      hProperties: {
        className: ['mermaid-diagram'],
        dataMermaidDiagram: '',
      },
      hChildren: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {
            className: ['mermaid'],
          },
          children: [{ type: 'text', value: source }],
        },
      ],
    };
    delete node.lang;
    delete node.value;
    node.children = [];
    return;
  }

  node.children?.forEach(visit);
}

export default function remarkMermaid() {
  return (tree: MdastNode) => {
    visit(tree);
  };
}
