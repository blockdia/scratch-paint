import paper from '@turbowarp/paper';

import {getControlPointGuideLayer} from './layer';
import {CENTER} from './view';

const GUIDE_COLOR = '#ffab19';
const POINT_COLOR = '#4c97ff';

const editorPointToProject = point => CENTER.add(new paper.Point(point[0] * 2, point[1] * -2));

const projectPointToEditor = (point, interval) => {
    const step = interval || 1;
    return [
        Math.round(((point.x - CENTER.x) / 2) / step) * step,
        Math.round(((CENTER.y - point.y) / 2) / step) * step
    ];
};

const setGuideItem = item => {
    item.guide = true;
    item.data.isControlPointGuide = true;
};

const drawControlPointGuide = function (guide, theme) {
    const layer = getControlPointGuideLayer();
    layer.removeChildren();
    layer.visible = Boolean(guide);
    if (!guide) return {};

    const zoom = paper.view.zoom || 1;
    const endpoints = {};
    const names = Object.keys(guide.points);
    if (names.length > 1) {
        const line = new paper.Path.Line(
            editorPointToProject(guide.points[names[0]].position),
            editorPointToProject(guide.points[names[1]].position)
        );
        line.strokeColor = GUIDE_COLOR;
        line.strokeWidth = 2 / zoom;
        line.strokeCap = 'round';
        setGuideItem(line);
        line.parent = layer;
    }

    names.forEach(name => {
        const definition = guide.points[name];
        const position = editorPointToProject(definition.position);
        const selected = guide.selected === name;
        const circle = new paper.Path.Circle(position, (selected ? 8 : 7) / zoom);
        circle.fillColor = '#ffffff';
        circle.strokeColor = name === 'start' ? GUIDE_COLOR : POINT_COLOR;
        circle.strokeWidth = (selected ? 4 : 3) / zoom;
        circle.data.controlPointGuideEndpoint = name;
        setGuideItem(circle);
        circle.parent = layer;
        endpoints[name] = circle;

        const label = new paper.PointText({
            content: definition.label,
            fillColor: theme === 'dark' ? '#ffffff' : '#1e1e1e',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontSize: 12 / zoom,
            justification: 'center',
            point: position.add(new paper.Point(0, 23 / zoom))
        });
        setGuideItem(label);
        label.parent = layer;
    });

    layer.bringToFront();
    return endpoints;
};

export {
    drawControlPointGuide,
    editorPointToProject,
    projectPointToEditor
};
