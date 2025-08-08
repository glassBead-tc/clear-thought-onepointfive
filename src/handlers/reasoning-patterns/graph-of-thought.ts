/**
 * Graph of Thought Pattern Handler Implementation
 * 
 * Implements non-hierarchical connections between thoughts with support
 * for complex reasoning patterns including cycles and multiple connections.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  GraphOfThoughtNode,
  GraphOfThoughtEdge,
  GraphOfThoughtSession,
  GraphOfThoughtConfig,
  GraphOfThoughtStats,
  GraphOfThoughtOperations,
  GraphNodeType,
  GraphEdgeType,
  NodeCluster,
  GraphAnalysisMetrics
} from '../../types/reasoning-patterns/graph-of-thought.js';
import { ThoughtData } from '../../types/index.js';

export class GraphOfThoughtHandler implements GraphOfThoughtOperations {
  private readonly defaultConfig: GraphOfThoughtConfig = {
    maxNodes: 100,
    maxEdges: 300,
    allowCycles: true,
    edgeWeightThreshold: 0.1,
    analysisAlgorithms: ['centrality', 'clustering'],
    defaultNodeType: 'hypothesis',
    autoPruneWeakEdges: false
  };

  /**
   * Initialize a new Graph of Thought session
   */
  initializeSession(config?: Partial<GraphOfThoughtConfig>): GraphOfThoughtSession {
    const sessionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    return {
      sessionId,
      patternType: 'graph',
      iteration: 0,
      nextStepNeeded: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      nodes: new Map(),
      edges: new Map(),
      entryNodeIds: [],
      explorationPath: [],
      config: { ...this.defaultConfig, ...config },
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        nodesByType: {} as Record<GraphNodeType, number>,
        edgesByType: {} as Record<GraphEdgeType, number>,
        averageDegree: 0,
        density: 0,
        connectedComponents: 0
      }
    };
  }

  /**
   * Add a node to the graph
   */
  addNode(
    nodeData: Omit<GraphOfThoughtNode, 'id' | 'incomingEdges' | 'outgoingEdges' | 'timestamp'>,
    session: GraphOfThoughtSession
  ): GraphOfThoughtNode {
    if (session.config.maxNodes && session.nodes.size >= session.config.maxNodes) {
      throw new Error(`Maximum nodes limit ${session.config.maxNodes} reached`);
    }

    const nodeId = uuidv4();
    const node: GraphOfThoughtNode = {
      id: nodeId,
      content: nodeData.content,
      timestamp: new Date().toISOString(),
      nodeType: nodeData.nodeType,
      strength: nodeData.strength,
      incomingEdges: [],
      outgoingEdges: [],
      metadata: nodeData.metadata
    };

    session.nodes.set(nodeId, node);
    
    // Update stats
    session.stats.totalNodes++;
    session.stats.nodesByType[node.nodeType] = 
      (session.stats.nodesByType[node.nodeType] || 0) + 1;
    
    // Add to entry nodes if it's the first or explicitly marked
    if (session.entryNodeIds.length === 0) {
      session.entryNodeIds.push(nodeId);
    }
    
    return node;
  }

  /**
   * Connect two nodes with an edge
   */
  connectNodes(
    sourceId: string,
    targetId: string,
    edgeType: GraphEdgeType,
    weight: number,
    session: GraphOfThoughtSession
  ): GraphOfThoughtEdge {
    const sourceNode = session.nodes.get(sourceId);
    const targetNode = session.nodes.get(targetId);
    
    if (!sourceNode || !targetNode) {
      throw new Error('Source or target node not found');
    }

    if (session.config.maxEdges && session.edges.size >= session.config.maxEdges) {
      throw new Error(`Maximum edges limit ${session.config.maxEdges} reached`);
    }

    // Check for cycles if not allowed
    if (!session.config.allowCycles && this.wouldCreateCycle(sourceId, targetId, session)) {
      throw new Error('Edge would create a cycle, which is not allowed');
    }

    const edgeId = uuidv4();
    const edge: GraphOfThoughtEdge = {
      id: edgeId,
      sourceId,
      targetId,
      edgeType,
      weight,
      metadata: {
        createdAt: new Date().toISOString()
      }
    };

    session.edges.set(edgeId, edge);
    
    // Update node connections
    sourceNode.outgoingEdges.push(edgeId);
    targetNode.incomingEdges.push(edgeId);
    
    // Update stats
    session.stats.totalEdges++;
    session.stats.edgesByType[edgeType] = 
      (session.stats.edgesByType[edgeType] || 0) + 1;
    this.updateGraphStats(session);
    
    // Auto-prune weak edges if enabled
    if (session.config.autoPruneWeakEdges && 
        session.config.edgeWeightThreshold &&
        weight < session.config.edgeWeightThreshold) {
      this.removeEdge(edgeId, session);
      throw new Error(`Edge weight ${weight} below threshold ${session.config.edgeWeightThreshold}`);
    }
    
    return edge;
  }

  /**
   * Find paths between two nodes
   */
  findPaths(
    startId: string,
    endId: string,
    session: GraphOfThoughtSession,
    maxPaths: number = 10
  ): string[][] {
    const paths: string[][] = [];
    const visited = new Set<string>();
    
    const dfs = (currentId: string, path: string[]) => {
      if (paths.length >= maxPaths) return;
      
      if (currentId === endId) {
        paths.push([...path]);
        return;
      }
      
      visited.add(currentId);
      const node = session.nodes.get(currentId);
      
      if (node) {
        for (const edgeId of node.outgoingEdges) {
          const edge = session.edges.get(edgeId);
          if (edge && !visited.has(edge.targetId)) {
            dfs(edge.targetId, [...path, edge.targetId]);
          }
        }
      }
      
      visited.delete(currentId);
    };
    
    dfs(startId, [startId]);
    return paths;
  }

  /**
   * Get node neighbors
   */
  getNeighbors(
    nodeId: string,
    direction: 'incoming' | 'outgoing' | 'both',
    session: GraphOfThoughtSession
  ): string[] {
    const node = session.nodes.get(nodeId);
    if (!node) return [];
    
    const neighbors = new Set<string>();
    
    if (direction === 'incoming' || direction === 'both') {
      node.incomingEdges.forEach(edgeId => {
        const edge = session.edges.get(edgeId);
        if (edge) neighbors.add(edge.sourceId);
      });
    }
    
    if (direction === 'outgoing' || direction === 'both') {
      node.outgoingEdges.forEach(edgeId => {
        const edge = session.edges.get(edgeId);
        if (edge) neighbors.add(edge.targetId);
      });
    }
    
    return Array.from(neighbors);
  }

  /**
   * Calculate node centrality (PageRank-like algorithm)
   */
  calculateCentrality(session: GraphOfThoughtSession): Map<string, number> {
    const centrality = new Map<string, number>();
    const damping = 0.85;
    const iterations = 100;
    
    // Initialize all nodes with equal centrality
    session.nodes.forEach((_, nodeId) => {
      centrality.set(nodeId, 1.0 / session.nodes.size);
    });
    
    // Power iteration
    for (let i = 0; i < iterations; i++) {
      const newCentrality = new Map<string, number>();
      
      session.nodes.forEach((node, nodeId) => {
        let rank = (1 - damping) / session.nodes.size;
        
        // Sum contributions from incoming nodes
        node.incomingEdges.forEach(edgeId => {
          const edge = session.edges.get(edgeId);
          if (edge) {
            const sourceNode = session.nodes.get(edge.sourceId);
            if (sourceNode) {
              const sourceRank = centrality.get(edge.sourceId) || 0;
              const outDegree = sourceNode.outgoingEdges.length || 1;
              rank += damping * edge.weight * sourceRank / outDegree;
            }
          }
        });
        
        newCentrality.set(nodeId, rank);
      });
      
      centrality.clear();
      newCentrality.forEach((value, key) => centrality.set(key, value));
    }
    
    // Store in session metrics
    if (!session.analysisMetrics) {
      session.analysisMetrics = {
        centrality: new Map()
      };
    }
    session.analysisMetrics.centrality = centrality;
    
    return centrality;
  }

  /**
   * Detect communities/clusters using simple connected components
   */
  detectCommunities(session: GraphOfThoughtSession): NodeCluster[] {
    const clusters: NodeCluster[] = [];
    const visited = new Set<string>();
    let clusterId = 0;
    
    session.nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        const cluster = this.exploreCluster(nodeId, session, visited);
        if (cluster.length > 0) {
          clusters.push({
            id: `cluster-${clusterId++}`,
            nodeIds: cluster,
            cohesion: this.calculateClusterCohesion(cluster, session),
            centroidNodeId: this.findClusterCentroid(cluster, session)
          });
        }
      }
    });
    
    // Store in session metrics
    if (!session.analysisMetrics) {
      session.analysisMetrics = {
        centrality: new Map()
      };
    }
    session.analysisMetrics.clusters = clusters;
    
    return clusters;
  }

  /**
   * Find contradictions in the graph
   */
  findContradictions(session: GraphOfThoughtSession): Array<{nodeIds: string[], description: string}> {
    const contradictions: Array<{nodeIds: string[], description: string}> = [];
    
    session.edges.forEach(edge => {
      if (edge.edgeType === 'contradicts') {
        contradictions.push({
          nodeIds: [edge.sourceId, edge.targetId],
          description: `Node ${edge.sourceId} contradicts ${edge.targetId}`
        });
      }
    });
    
    // Find cycles that might indicate contradictions
    const cycles = this.findCycles(session);
    cycles.forEach(cycle => {
      if (cycle.length > 2) {
        contradictions.push({
          nodeIds: cycle,
          description: `Potential circular reasoning detected`
        });
      }
    });
    
    return contradictions;
  }

  /**
   * Merge similar nodes
   */
  mergeNodes(nodeIds: string[], session: GraphOfThoughtSession): GraphOfThoughtNode {
    if (nodeIds.length < 2) {
      throw new Error('Need at least 2 nodes to merge');
    }
    
    const nodes = nodeIds.map(id => session.nodes.get(id)).filter(Boolean) as GraphOfThoughtNode[];
    if (nodes.length !== nodeIds.length) {
      throw new Error('Some nodes not found');
    }
    
    // Create merged node
    const mergedContent = nodes.map(n => n.content).join(' | ');
    const avgStrength = nodes.reduce((sum, n) => sum + n.strength, 0) / nodes.length;
    const mergedNode = this.addNode({
      content: `Merged: ${mergedContent}`,
      nodeType: nodes[0].nodeType,
      strength: avgStrength,
      metadata: {}
    }, session);
    
    // Redirect all edges
    nodeIds.forEach(nodeId => {
      const node = session.nodes.get(nodeId);
      if (node) {
        // Redirect incoming edges
        node.incomingEdges.forEach(edgeId => {
          const edge = session.edges.get(edgeId);
          if (edge && edge.sourceId !== mergedNode.id) {
            this.connectNodes(
              edge.sourceId,
              mergedNode.id,
              edge.edgeType,
              edge.weight,
              session
            );
          }
        });
        
        // Redirect outgoing edges
        node.outgoingEdges.forEach(edgeId => {
          const edge = session.edges.get(edgeId);
          if (edge && edge.targetId !== mergedNode.id) {
            this.connectNodes(
              mergedNode.id,
              edge.targetId,
              edge.edgeType,
              edge.weight,
              session
            );
          }
        });
        
        // Remove original node
        this.removeNode(nodeId, session);
      }
    });
    
    return mergedNode;
  }

  /**
   * Export to sequential thinking format
   */
  exportToSequentialFormat(session: GraphOfThoughtSession): ThoughtData[] {
    const thoughts: ThoughtData[] = [];
    
    // Find a path through the graph (topological sort-like)
    const visited = new Set<string>();
    const sortedNodes: GraphOfThoughtNode[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = session.nodes.get(nodeId);
      if (node) {
        // Visit dependencies first
        node.incomingEdges.forEach(edgeId => {
          const edge = session.edges.get(edgeId);
          if (edge) visit(edge.sourceId);
        });
        sortedNodes.push(node);
      }
    };
    
    // Start from entry nodes
    session.entryNodeIds.forEach(visit);
    
    // Visit any unvisited nodes
    session.nodes.forEach((_, nodeId) => visit(nodeId));
    
    // Convert to thoughts
    sortedNodes.forEach((node, index) => {
      thoughts.push({
        thought: `[${node.nodeType}] ${node.content}`,
        thoughtNumber: index + 1,
        totalThoughts: sortedNodes.length,
        nextThoughtNeeded: index < sortedNodes.length - 1
      });
    });
    
    return thoughts;
  }

  /**
   * Import from sequential thinking format
   */
  importFromSequentialFormat(thoughts: ThoughtData[]): GraphOfThoughtSession {
    const session = this.initializeSession();
    const nodeMap = new Map<number, string>();
    
    thoughts.forEach((thought, index) => {
      const node = this.addNode({
        content: thought.thought,
        nodeType: 'hypothesis',
        strength: 0.5
      }, session);
      
      nodeMap.set(index, node.id);
      
      // Connect to previous node
      if (index > 0) {
        const prevNodeId = nodeMap.get(index - 1);
        if (prevNodeId) {
          this.connectNodes(
            prevNodeId,
            node.id,
            'leads-to',
            0.8,
            session
          );
        }
      }
    });
    
    return session;
  }

  // Helper methods

  private wouldCreateCycle(sourceId: string, targetId: string, session: GraphOfThoughtSession): boolean {
    // Simple DFS to check if targetId can reach sourceId
    const visited = new Set<string>();
    
    const canReach = (fromId: string, toId: string): boolean => {
      if (fromId === toId) return true;
      if (visited.has(fromId)) return false;
      
      visited.add(fromId);
      const node = session.nodes.get(fromId);
      
      if (node) {
        for (const edgeId of node.outgoingEdges) {
          const edge = session.edges.get(edgeId);
          if (edge && canReach(edge.targetId, toId)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    return canReach(targetId, sourceId);
  }

  private updateGraphStats(session: GraphOfThoughtSession): void {
    const nodeCount = session.nodes.size;
    const edgeCount = session.edges.size;
    
    if (nodeCount > 0) {
      // Average degree
      let totalDegree = 0;
      session.nodes.forEach(node => {
        totalDegree += node.incomingEdges.length + node.outgoingEdges.length;
      });
      session.stats.averageDegree = totalDegree / nodeCount;
      
      // Density
      const maxPossibleEdges = nodeCount * (nodeCount - 1);
      session.stats.density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    }
  }

  private exploreCluster(
    startNodeId: string,
    session: GraphOfThoughtSession,
    visited: Set<string>
  ): string[] {
    const cluster: string[] = [];
    const queue = [startNodeId];
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      cluster.push(nodeId);
      
      const neighbors = this.getNeighbors(nodeId, 'both', session);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }
    
    return cluster;
  }

  private calculateClusterCohesion(nodeIds: string[], session: GraphOfThoughtSession): number {
    if (nodeIds.length <= 1) return 1;
    
    let internalEdges = 0;
    let possibleEdges = nodeIds.length * (nodeIds.length - 1);
    
    const nodeSet = new Set(nodeIds);
    
    nodeIds.forEach(nodeId => {
      const node = session.nodes.get(nodeId);
      if (node) {
        node.outgoingEdges.forEach(edgeId => {
          const edge = session.edges.get(edgeId);
          if (edge && nodeSet.has(edge.targetId)) {
            internalEdges++;
          }
        });
      }
    });
    
    return possibleEdges > 0 ? internalEdges / possibleEdges : 0;
  }

  private findClusterCentroid(nodeIds: string[], session: GraphOfThoughtSession): string {
    const centrality = this.calculateCentrality(session);
    
    let maxCentrality = -1;
    let centroid = nodeIds[0];
    
    nodeIds.forEach(nodeId => {
      const score = centrality.get(nodeId) || 0;
      if (score > maxCentrality) {
        maxCentrality = score;
        centroid = nodeId;
      }
    });
    
    return centroid;
  }

  private findCycles(session: GraphOfThoughtSession): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (nodeId: string, path: string[]): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      const node = session.nodes.get(nodeId);
      if (node) {
        for (const edgeId of node.outgoingEdges) {
          const edge = session.edges.get(edgeId);
          if (edge) {
            if (recursionStack.has(edge.targetId)) {
              // Found a cycle
              const cycleStart = path.indexOf(edge.targetId);
              if (cycleStart !== -1) {
                cycles.push([...path.slice(cycleStart), edge.targetId]);
              }
            } else if (!visited.has(edge.targetId)) {
              dfs(edge.targetId, [...path, edge.targetId]);
            }
          }
        }
      }
      
      recursionStack.delete(nodeId);
    };
    
    session.nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId, [nodeId]);
      }
    });
    
    return cycles;
  }

  private removeNode(nodeId: string, session: GraphOfThoughtSession): void {
    const node = session.nodes.get(nodeId);
    if (!node) return;
    
    // Remove all connected edges
    [...node.incomingEdges, ...node.outgoingEdges].forEach(edgeId => {
      this.removeEdge(edgeId, session);
    });
    
    // Remove node
    session.nodes.delete(nodeId);
    session.stats.totalNodes--;
    
    // Update entry nodes if needed
    const entryIndex = session.entryNodeIds.indexOf(nodeId);
    if (entryIndex !== -1) {
      session.entryNodeIds.splice(entryIndex, 1);
    }
  }

  private removeEdge(edgeId: string, session: GraphOfThoughtSession): void {
    const edge = session.edges.get(edgeId);
    if (!edge) return;
    
    // Remove from source node
    const sourceNode = session.nodes.get(edge.sourceId);
    if (sourceNode) {
      const index = sourceNode.outgoingEdges.indexOf(edgeId);
      if (index !== -1) {
        sourceNode.outgoingEdges.splice(index, 1);
      }
    }
    
    // Remove from target node
    const targetNode = session.nodes.get(edge.targetId);
    if (targetNode) {
      const index = targetNode.incomingEdges.indexOf(edgeId);
      if (index !== -1) {
        targetNode.incomingEdges.splice(index, 1);
      }
    }
    
    // Remove edge
    session.edges.delete(edgeId);
    session.stats.totalEdges--;
  }
}

export default GraphOfThoughtHandler;