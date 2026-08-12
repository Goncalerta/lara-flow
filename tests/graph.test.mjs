import assert from "node:assert/strict";
import { describe, test } from "node:test";

import Graph from "../dist/graph/Graph.js";
import IncrementingIdGenerator from "../dist/graph/id/IncrementingIdGenerator.js";
import DijkstraSearch from "../dist/graph/search/DijkstraSearch.js";

function createDiamondGraph() {
    const graph = Graph.create()
        .setNodeIdGenerator(new IncrementingIdGenerator("n"))
        .setEdgeIdGenerator(new IncrementingIdGenerator("e"));
    const root = graph.addNode();
    const left = graph.addNode();
    const right = graph.addNode();
    const leaf = graph.addNode();

    const rootToLeft = graph.addEdge(root, left);
    const rootToRight = graph.addEdge(root, right);
    const leftToLeaf = graph.addEdge(left, leaf);
    const rightToLeaf = graph.addEdge(right, leaf);

    return {
        graph,
        root,
        left,
        right,
        leaf,
        rootToLeft,
        rootToRight,
        leftToLeaf,
        rightToLeaf,
    };
}

describe("graph construction", () => {
    test("generates deterministic ids and exposes graph relationships", () => {
        const { graph, root, left, right, leaf, rootToLeft } = createDiamondGraph();

        assert.deepEqual(
            graph.nodes.toArray().map((node) => node.id),
            ["n0", "n1", "n2", "n3"],
        );
        assert.deepEqual(
            graph.edges.toArray().map((edge) => edge.id),
            ["e0", "e1", "e2", "e3"],
        );
        assert.equal(graph.getNodeById("n2")?.id, right.id);
        assert.equal(graph.getEdgeById("e0")?.target.id, left.id);
        assert.deepEqual(
            root.outgoers.toArray().map((edge) => edge.target.id),
            [left.id, right.id],
        );
        assert.deepEqual(
            root.successors
                .toArray()
                .map((node) => node.id)
                .sort(),
            [left.id, right.id, leaf.id].sort(),
        );
        assert.deepEqual(
            leaf.incomers.toArray().map((edge) => edge.source.id),
            [left.id, right.id],
        );
        assert.deepEqual(
            leaf.predecessors
                .toArray()
                .map((node) => node.id)
                .sort(),
            [root.id, left.id, right.id].sort(),
        );

        rootToLeft.remove();
        assert.equal(rootToLeft.isRemoved, true);
        assert.equal(graph.edges.length, 3);
        rootToLeft.restore();
        assert.equal(rootToLeft.isRemoved, false);
        assert.equal(graph.edges.length, 4);
    });
});

describe("graph searches", () => {
    test("visits a branching graph in breadth-first and depth-first order", () => {
        const { root } = createDiamondGraph();

        const breadthFirst = [...root.bfs()];
        assert.deepEqual(
            breadthFirst.map(({ node }) => node.id),
            ["n0", "n1", "n2", "n3"],
        );
        assert.deepEqual(
            breadthFirst.map(({ path }) => path.length),
            [0, 1, 1, 2],
        );

        const depthFirst = [...root.dfs()];
        assert.deepEqual(
            depthFirst.map(({ node }) => node.id),
            ["n0", "n2", "n3", "n1"],
        );
    });

    test("prunes edges with a propagation predicate", () => {
        const { root, rootToRight } = createDiamondGraph();

        const visits = [...root.bfs((edge) => edge.id !== rootToRight.id)];

        assert.deepEqual(
            visits.map(({ node }) => node.id),
            ["n0", "n1", "n3"],
        );
    });

    test("Dijkstra search finds the lowest-cost path", () => {
        const graph = Graph.create();
        const root = graph.addNode("root");
        const direct = graph.addNode("direct");
        const detour = graph.addNode("detour");

        graph.addEdge(root, direct, "expensive").data.weight = 5;
        graph.addEdge(root, detour, "cheap-start").data.weight = 1;
        graph.addEdge(detour, direct, "cheap-finish").data.weight = 1;

        const visits = [
            ...root.search(new DijkstraSearch((edge) => edge.data.weight)),
        ];

        assert.deepEqual(
            visits.map(({ node, distance }) => [node.id, distance]),
            [
                ["root", 0],
                ["detour", 1],
                ["direct", 2],
            ],
        );
        assert.deepEqual(
            visits.at(-1).path.map((edge) => edge.id),
            ["cheap-start", "cheap-finish"],
        );
    });
});
