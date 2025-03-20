import cytoscape from "../node_modules/cytoscape/dist/cytoscape.esm.min.mjs";

"use strict"

/*
    Detta script använder Cytoscape.js för att parsa, sammanställa
    och rendera TAB3-formaterade dataset från BioGRID. Dokumentation kring
    TAB3-formateringen kan finnas här: https://wiki.thebiogrid.org/doku.php/biogrid_tab_version_3.0
*/

// Ange sökvägarna till dina dataset
const datasets = ['../json_parser/tp73.json', '../json_parser/abl1.json'];

// Tar emot arrayen av sökvägar till dataseten och sammanställer dem
const mergeJSONDatasets = async function(datasets){
    let mergedDatasets = [];

    for(let dataset of datasets){
        try{
            const response = await fetch(dataset);
            const data = await response.json();
            mergedDatasets = mergedDatasets.concat(data)
        }
        catch(error){
            console.log(`There was an error fetching ${dataset}: `, error);
        }
    }
    return mergedDatasets;
}

// Parsar sammanställt dataset till Cytoscape-data
const convertToCytoscape = function(biogridData){
    const nodes = new Map(); // En map säkerställer att endast unika noder renderas
    const edges = [];
    const expSys = new Map(); // Alla experimental systems

    biogridData.forEach(interaction => {
        const interactorA = interaction["Official Symbol Interactor A"];
        const interactorB = interaction["Official Symbol Interactor B"];
        const throughput = interaction["Throughput"];
        const experimentalSystem = interaction["Experimental System"];

        // Lägger till noder som inte redan existerar
        if (!nodes.has(interactorA)) nodes.set(interactorA, { data: { id: interactorA, name: interactorA, throughput, experimentalSystem } });
        if (!nodes.has(interactorB)) nodes.set(interactorB, { data: { id: interactorB, name: interactorB, throughput, experimentalSystem } });

        if(!expSys.has(experimentalSystem)) expSys.set(experimentalSystem, experimentalSystem)

        // Lägger till en edge (relation mellan två noder)
        edges.push({
            data: {
                source: interactorA,
                target: interactorB,
                experimentalSystem
                // interaction: interaction["Experimental System"],
                // type: interaction["Experimental System Type"]
            }
        });
    });

    console.log(`Noder ${nodes.size}, Edges ${edges.length}}`)
    console.log(expSys)
    return [...nodes.values(), ...edges]; // Separerar och kombinerar node map och edge array till en enhetlig array
}

const renderCytoscape = function(elements){
    cytoscape({
        container: document.getElementById("cy"), // Pekar på DOM elementet där renderingen sker
        elements: elements,
        style: [
            { selector: "node", // Standard färg på en nod
                style: {
                    "label": "data(name)",
                    "background-color": "#0074D9", // Blå
                    "height": "30px",
                    "width": "30px",
                }
            },
            { selector: "node[throughput = 'High Throughput']", // Ändrar färgen till röd vid hög throughput
                style: {
                    "background-color": "#ff6666", // Röd
                }
            },
            { selector: "edge",
                style: {
                    "width": 2,
                    "line-color": "gray",
                }
            },
        ],
        layout: {
            name: "concentric",
            animate: false,
         }
    });
}

mergeJSONDatasets(datasets).then(datasets => {
    const elements = convertToCytoscape(datasets)
    renderCytoscape(elements);
})

window.addEventListener('load', () => {
	
    const getPerformance = function(){
        const perf = performance.getEntriesByType('navigation')[0];
        console.log(perf)
        console.log("This is a repo now")
    }

    getPerformance();
})