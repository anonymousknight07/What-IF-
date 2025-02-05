import { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface TrackedDecision {
  id: string;
  date: string;
  situation: string;
  choiceMade: string;
  outcome: string;
}

interface DecisionGraphProps {
  decisions: TrackedDecision[];
}

const nodeStyles = {
  background: 'rgba(247, 194, 194, 0.1)',
  border: '1px solid #ff7474',
  borderRadius: '50%',
  padding: '20px',
  color: '#fff',
  boxShadow: '0 0 20px #ff7474, inset 0 0 10px #ff7474',
  minWidth: '150px',
  backdropFilter: 'blur(5px)',
};

const edgeStyles = {
  stroke: '#ff7474',
  strokeWidth: 2,
  opacity: 0.7,
};

export function DecisionGraph({ decisions }: DecisionGraphProps) {
  const initialNodes: Node[] = decisions.map((decision, index) => ({
    id: decision.id,
    data: {
      label: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>{decision.situation}</div>
          <div style={{ fontSize: '12px', color: '#ff7474' }}>→ {decision.choiceMade}</div>
        </div>
      ),
    },
    position: { 
      x: index * 300, 
      y: Math.sin(index * Math.PI / 2) * 150 
    },
    style: nodeStyles,
    type: 'default',
  }));

  const initialEdges: Edge[] = decisions.slice(1).map((decision, index) => ({
    id: `e${index}`,
    source: decisions[index].id,
    target: decision.id,
    animated: true,
    style: edgeStyles,
    type: 'smoothstep',
  }));

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback(() => {
    console.log('Flow initialized');
  }, []);

  return (
    <div style={{ height: '600px', width: '100%', background: '#000' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background 
          color="#ff7474" 
          gap={20} 
          size={1} 
          style={{ opacity: 0.1 }}
        />
        <Controls 
          style={{ 
            button: { 
              background: '#000', 
              color: '#ff7474',
              border: '1px solid #ff7474',
              '&:hover': { background: '#ff747422' }
            } 
          }} 
        />
      </ReactFlow>
    </div>
  );
}