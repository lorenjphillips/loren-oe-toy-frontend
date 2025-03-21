# Knowledge Graph Visualization System

This module provides a comprehensive visualization framework for medical knowledge graphs, illustrating complex relationships between treatments, conditions, biomarkers and other medical concepts.

## Components

### Core Components

- **GraphEngine**: The main rendering engine built with D3.js that handles the visualization, physics simulation, and interactions.
- **NodeTypes**: Defines the visual representation of different node types (Medical Concept, Treatment, Drug, Biomarker, etc.) with appropriate icons and styling.
- **EdgeTypes**: Defines the visual representation of relationships between nodes, with color-coding and styling based on relationship type and evidence strength.
- **InteractionControls**: Provides UI controls for user interaction with the graph, including zoom, pan, filtering, and information display.
- **KnowledgeGraphDemo**: A demo component that showcases the visualization system with sample data.

### Data Models

The system relies on several data models defined in `app/models/knowledgeGraph.ts`:

- `KnowledgeGraph`: The main container for nodes and relationships.
- `MedicalConceptNode`: Represents medical concepts like conditions, symptoms, and biomarkers.
- `TreatmentNode`: Represents treatments including drugs, procedures, and therapies.
- **Relationship**: Defines relationships between nodes with metadata including evidence strength, citations, and bidirectionality.

## Features

- **Interactive Visualization**: Pan, zoom, and explore the graph with smooth animations.
- **Node Type Differentiation**: Clear visual differentiation between different types of nodes.
- **Relationship Styling**: Relationships are styled based on type and evidence strength.
- **Filtering**: Filter the graph by node type, relationship type, and evidence strength.
- **Info Panel**: Detailed information about selected nodes and relationships, including citations.
- **Responsive Design**: Works on various screen sizes with appropriate layout adjustments.

## Sample Data

The system comes with a sample oncology knowledge graph in `app/data/knowledgeGraphs/oncologyGraph.ts` that demonstrates relationships between:

- Breast cancer types (HER2-positive, Triple-negative)
- Biomarkers (HER2 overexpression, BRCA mutations)
- Treatments (Trastuzumab, Pertuzumab, Mastectomy)
- Medical concepts (Cancer Cell Proliferation, Tumor Metastasis)

Each relationship includes evidence strength, descriptions, and scientific citations.

## Usage

To use the knowledge graph visualization in a page:

```jsx
import KnowledgeGraphDemo from '../components/knowledge-graph/KnowledgeGraphDemo';

// In your component:
return (
  <div>
    <h1>Knowledge Graph Visualization</h1>
    <KnowledgeGraphDemo />
  </div>
);
```

To create your own knowledge graph, follow the data structure in the sample oncology graph and pass it to the GraphEngine component.

## Future Enhancements

- Advanced search functionality for finding specific nodes
- Customizable graph layouts
- Node grouping and clustering
- Export functionality for saving graphs as images or data files
- Integration with external knowledge sources and APIs 