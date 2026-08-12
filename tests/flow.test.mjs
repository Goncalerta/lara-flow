import assert from "node:assert/strict";
import { describe, test } from "node:test";

import LaraFlowError from "../dist/error/LaraFlowError.js";
import ControlFlowEdge from "../dist/flow/ControlFlowEdge.js";
import ControlFlowNode from "../dist/flow/ControlFlowNode.js";
import FlowGraph from "../dist/flow/FlowGraph.js";
import Graph from "../dist/graph/Graph.js";

function createFlowGraph() {
    return Graph.create().init(new FlowGraph.Builder()).as(FlowGraph);
}

function addControlFlowNode(graph, functionNode, id) {
    return graph
        .addNode(id)
        .init(new ControlFlowNode.Builder(functionNode))
        .as(ControlFlowNode);
}

describe("flow graphs", () => {
    test("registers, finds, and renames functions", () => {
        const graph = createFlowGraph();
        const main = graph.addFunction("main");

        assert.equal(graph.hasFunction("main"), true);
        assert.equal(graph.getFunction("main")?.id, main.id);
        assert.equal(graph.getOrAddFunction("main").id, main.id);
        assert.equal(graph.functions.length, 1);
        assert.throws(() => graph.addFunction("main"), LaraFlowError);

        main.renameFunction("entrypoint");
        assert.equal(graph.hasFunction("main"), false);
        assert.equal(graph.getFunction("entrypoint")?.id, main.id);
    });

    test("tracks CFG entry nodes and excludes fake outgoing edges", () => {
        const graph = createFlowGraph();
        const main = graph.addFunction("main");
        const entry = addControlFlowNode(graph, main, "entry").setAsEntryNode();
        const liveTarget = addControlFlowNode(graph, main, "live");
        const fakeTarget = addControlFlowNode(graph, main, "fake");

        const liveEdge = graph
            .addEdge(entry, liveTarget, "live-edge")
            .init(new ControlFlowEdge.Builder())
            .as(ControlFlowEdge);
        const fakeEdge = graph
            .addEdge(entry, fakeTarget, "fake-edge")
            .init(new ControlFlowEdge.Builder().fake())
            .as(ControlFlowEdge);

        assert.equal(main.cfgEntryNode?.id, entry.id);
        assert.equal(entry.function.id, main.id);
        assert.deepEqual(
            main.controlFlowNodes.toArray().map((node) => node.id),
            [entry.id, liveTarget.id, fakeTarget.id],
        );
        assert.deepEqual(
            entry.cfgOutgoers.toArray().map((edge) => edge.id),
            [liveEdge.id],
        );

        fakeEdge.isFake = false;
        assert.deepEqual(
            entry.cfgOutgoers.toArray().map((edge) => edge.id),
            [liveEdge.id, fakeEdge.id],
        );
    });

    test("rejects an entry node belonging to a different function", () => {
        const graph = createFlowGraph();
        const main = graph.addFunction("main");
        const helper = graph.addFunction("helper");
        const helperEntry = addControlFlowNode(graph, helper, "helper-entry");

        assert.throws(() => {
            main.cfgEntryNode = helperEntry;
        }, LaraFlowError);
    });
});
