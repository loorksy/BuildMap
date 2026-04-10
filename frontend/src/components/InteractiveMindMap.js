import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const NODE_COLORS = [
  'hsl(222, 80%, 55%)',   // blue primary
  'hsl(165, 65%, 45%)',   // teal
  'hsl(280, 60%, 55%)',   // purple
  'hsl(35, 85%, 55%)',    // amber
  'hsl(350, 70%, 55%)',   // rose
  'hsl(200, 70%, 50%)',   // sky
];

function MindMapNode({ data }) {
  const bgColor = data.color || NODE_COLORS[0];
  const isRoot = data.level === 0;

  return (
    <div
      className="px-4 py-2.5 rounded-xl shadow-lg border-2 text-center transition-transform hover:scale-105"
      style={{
        background: bgColor,
        borderColor: `${bgColor}88`,
        color: '#fff',
        fontSize: isRoot ? '15px' : '13px',
        fontWeight: isRoot ? 700 : 500,
        minWidth: isRoot ? 160 : 100,
        maxWidth: 200,
        direction: 'rtl',
      }}
      data-testid={`mindmap-node-${data.label?.slice(0, 15)}`}
    >
      {data.label}
    </div>
  );
}

const nodeTypes = { mindmap: MindMapNode };

function buildFlowData(mindmapData) {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  function traverse(node, parentId, level, siblingIdx, totalSiblings) {
    const id = `node-${nodeId++}`;
    const children = node.children || [];
    const colorIdx = level % NODE_COLORS.length;

    // Layout: center root, spread children radially for level 1, then cascade down
    let x = 0;
    let y = 0;

    if (level === 0) {
      x = 0;
      y = 0;
    } else if (level === 1) {
      const angle = ((siblingIdx / totalSiblings) * Math.PI * 2) - Math.PI / 2;
      const radius = 220;
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
    } else {
      const spread = Math.max(140, 180 - level * 20);
      const offset = (siblingIdx - (totalSiblings - 1) / 2) * spread;
      x = offset;
      y = level * 120;
    }

    nodes.push({
      id,
      type: 'mindmap',
      position: { x, y },
      data: {
        label: node.title || node.name || 'عنصر',
        level,
        color: NODE_COLORS[colorIdx],
      },
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${id}`,
        source: parentId,
        target: id,
        style: { stroke: NODE_COLORS[colorIdx], strokeWidth: 2 },
        type: 'smoothstep',
        animated: level <= 1,
      });
    }

    children.forEach((child, idx) => {
      traverse(child, id, level + 1, idx, children.length);
    });
  }

  traverse(mindmapData, null, 0, 0, 1);
  return { nodes, edges };
}

export default function InteractiveMindMap({ data }) {
  const parsed = useMemo(() => {
    try {
      if (typeof data === 'string') {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = data.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : data;
        return JSON.parse(jsonStr.trim());
      }
      return data;
    } catch {
      return null;
    }
  }, [data]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => (parsed ? buildFlowData(parsed) : { nodes: [], edges: [] }),
    [parsed]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!parsed) {
    return (
      <pre className="bg-muted p-4 overflow-x-auto text-sm rounded-xl whitespace-pre-wrap" dir="rtl">
        {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-border" data-testid="interactive-mindmap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          position="bottom-left"
          style={{ direction: 'ltr' }}
        />
        <Background color="#8884" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
