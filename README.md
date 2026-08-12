# flow

The primary purpose of this library is control-flow, data-flow, static-call, and other graphs for [lara](https://github.com/specs-feup/lara-framework). As it does not actually depend on lara, it can also be used simply as a cytoscape abstraction for other graph purposes with increased type safety and structure.

## Guides and documentation

- For beginners, the [tutorial slides](https://docs.google.com/presentation/d/12MFa4gRFgww5UEhwkhwruNa6gSwKDVUk7iUVO5qNzwc/edit?usp=sharing) can be a good starting point, as it introduces the main capabilities and concepts of the library, with simple and intuitive examples of how to use it.
- For a more thorough description, check out the [documentation page](https://specs-feup.github.io/modules/_specs_feup_flow.html).

## Development setup

To start development on an unpublished version, create a new folder with the following package.json:

```json
{
    "name": "my-workspace",
    "type": "module",
    "workspaces": [
        "flow"
    ]
}
```

Then, inside the folder, run the following commands:

```sh
git clone https://github.com/specs-feup/flow
npm i
npm run -w flow build
npm i
```

Now flow is installed in this workspace and can be imported as a module. You can add your own package(s) to the workspaces array to develop them alongside flow. Make sure that these packages have flow as a dependency in their package.json.

