const data = [
    {
        "id": 1,
        "value": "Consectetur adipisicing elit. Dicta?",
        "children": [2, 3],
        "selected": false,
        "top_level": true
    },
    {
        "id": 2,
        "value": "Facilis modi molestiae?",
        "children": [4, 5],
        "selected": false,
        "parent": 1
    },
    {
        "id": 3,
        "value": "Nihil nulla numquam odio?",
        "children": [6, 7],
        "selected": false,
        "parent": 1
    },
    {
        "id": 4,
        "value": "Optio similique. Asperiores?",
        "children": [8, 9],
        "selected": false,
        "parent": 2
    },
    {
        "id": 5,
        "value": "Cumque excepturi repudiandae?",
        "children": [10, 11],
        "selected": false,
        "parent": 2
    },
    {
        "id": 6,
        "value": "Vel. Doloremque?",
        "children": [12, 13],
        "selected": false,
        "parent": 3
    },
    {
        "id": 7,
        "value": "Placeat repudiandae?",
        "selected": false,
        "parent": 3
    },
    {
        "id": 8,
        "value": "Suscipit voluptate?",
        "selected": false,
        "parent": 4
    },
    {
        "id": 9,
        "value": "Lorem ipsum dolor sit amet?",
        "children": [14, 15],
        "selected": false,
        "parent": 4
    },
    {
        "id": 10,
        "value": "Commodi consectetur consequatur cupiditate?",
        "selected": false,
        "parent": 5
    },
    {
        "id": 11,
        "value": "Expedita illo quas repudiandae?",
        "selected": false,
        "parent": 5
    },
    {
        "id": 12,
        "value": "Veritatis voluptas voluptatum?",
        "selected": false,
        "parent": 6
    },
    {
        "id": 13,
        "value": "Maiores minima, nam nemo?",
        "selected": false,
        "parent": 6
    },
    {
        "id": 14,
        "value": "Placeat qui quibusdam quod sit?",
        "selected": false,
        "parent": 9
    },
    {
        "id": 15,
        "value": "Commodi corporis dolore?",
        "selected": false,
        "parent": 9
    }
];


const margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 1200 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;


const treemap = d3.tree().size([height, width]);
const duration = 750;

let selected = null;

fillTable();

function fillTable() {
    const tbody = document.querySelector('tbody');
    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        const td_Questions = document.createElement('td');
        const td_Questions_id = document.createElement('td');
        const td_Children_id = document.createElement('td');
        th.innerHTML = index + 1;
        td_Questions.innerHTML = item.value;
        td_Questions_id.innerHTML = item.id;
        td_Children_id.innerHTML = item.children ? item.children.join(',') : ' ';
        tr.appendChild(th);
        tr.appendChild(td_Questions);
        tr.appendChild(td_Questions_id);
        tr.appendChild(td_Children_id);
        tbody.appendChild(tr);
    });
    console.log(tbody);
}


const svg = d3.select(".wrapper").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let i = 0;

findTopLevel();
const div = d3.select(".wrapper").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

delete selected.children;

const root = d3.hierarchy(selected);
root.x0 = height / 2;
root.y0 = 0;
update(root);


function update(source) {
    // Assigns the x and y position for the nodes
    const treeData = treemap(root);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 180
    });

    // ### LINKS

    // Update the links...
    const link = svg.selectAll('line.link').data(links, (d) => d.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter()
        .append('line')
        .attr("class", "link")
        .attr("stroke-width", 2)
        .attr("stroke", 'black')
        .attr('x1', () => source.y0)
        .attr('y1', () => source.x0)
        .attr('x2', () => source.y0)
        .attr('y2', () => source.x0);

    const linkUpdate = linkEnter.merge(link);

    linkUpdate
        .transition()
        .duration(duration)
        .attr('x1', d => d.parent.y)
        .attr('y1', d => d.parent.x)
        .attr('x2', d => d.y)
        .attr('y2', d => d.x);

    // Transition back to the parent element position
    linkUpdate
        .transition()
        .duration(duration)
        .attr('x1', (d) => d.parent.y + 100)
        .attr('y1', (d) => d.parent.x)
        .attr('x2', (d) => d.y)
        .attr('y2', (d) => d.x);

    // Remove any exiting links
    const linkExit = link.exit()
        .transition()
        .duration(duration)
        .attr('x1', () => source.x)
        .attr('y1', () => source.y)
        .attr('x2', () => source.x)
        .attr('y2', () => source.y).remove();

    // ### CIRCLES

    // Update the nodes...

    const node = svg.selectAll('g.node')
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node.enter().append('g').attr('class', 'node')
        .attr("transform", (d) => "translate(" + source.y0 + "," + source.x0 + ")")
        .on('click', click)
        .on("mouseover", function (d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.data.value)
                .style("left", (d3.event.offsetX - 30) + "px")
                .style("top", (d3.event.offsetY - 30) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    // .call(handleMoveEvents)


    nodeEnter.append('rect')
        .attr('id', d => d.id)
        .attr('class', 'node')
        .attr('width', 100)
        .attr('height', 70)
        .attr('y', -37.5)
        .attr('x', 0)
        .attr('cursor', 'pointer')
        .style("fill", "#0e4677");

    nodeEnter.append('text')
        .attr('class', 'label')
        .style("font-size", "18px")
        .attr('dx', 45)
        .attr('dy', 0)
        .style('fill', 'white')
        .text(d => d.data.id);


    // Update
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
        .transition()
        .duration(duration)
        .attr("transform", (d) => "translate(" + d.y + "," + d.x + ")");

    // Update the node attributes and style
    // nodeUpdate.select('rect.node').attr('r', 25).style("fill", function (d) {
    //     return "#0e4677";
    // })

    // Remove any exiting nodes
    const nodeExit = node.exit().transition().duration(duration)
        .attr("transform", (d) => "translate(" + source.y + "," + source.x + ")")
        .remove();

    // On exit reduce the node circles size to 0
    // nodeExit.select('circle').attr('r', 0);

    // Store the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Toggle children on click.
    function click(d) {
        const el = data.find(item => item.id === d.data.id);
        el.selected = true;
        selected = d;
        if (selected.parent) {
            const sublingElements = selected.parent.children.filter(item => item.id !== d.data.id);
            sublingElements.forEach(item => {
                if (!item.data.selected && !selected.hasOwnProperty('children') && !item.hasOwnProperty('children')) {
                    const sublingElement = document.getElementById(`${item.id}`);
                    sublingElement.style.fill = 'lightgrey';
                    prepareForUpdate();
                }
            })
        } else if (!selected.hasOwnProperty('children')) {
            prepareForUpdate();
        }
    }
}


function prepareForUpdate() {
    const foundEl = data.filter(item => item.parent === selected.data.id);
    if (!foundEl.length) {
        let path = data.filter(item => item.selected);
        path = path.map(item => item.value).join(' --> ');
        alert(JSON.stringify(path, null, 2));
    }

    foundEl.forEach(item => {
        delete item.children;
        const newNode = d3.hierarchy(item);
        newNode.depth = selected.depth + 1;
        newNode.height = selected.height - 1;
        newNode.parent = selected;
        newNode.data = item;

        if (!selected.children) {
            selected.children = [];
            selected.data.children = [];
        }
        selected.children.push(newNode);
        selected.data.children.push(newNode.data);
        update(selected);
    });
}

function findTopLevel() {
    const el = data.find(item => item.hasOwnProperty('top_level'));
    selected = el
}

