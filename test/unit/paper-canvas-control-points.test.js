/* eslint-env jest, browser */
import paper from '@turbowarp/paper';
import ConnectedPaperCanvas from '../../src/containers/paper-canvas';

const PaperCanvas = ConnectedPaperCanvas.WrappedComponent;

const setup = () => {
    const canvas = new PaperCanvas({cursor: 'default'});
    canvas.canvas = document.createElement('canvas');
    canvas.currentControlPointGuide = {
        selected: 'start',
        points: {start: {position: [0, 0]}},
        onStart: jest.fn(),
        onChange: jest.fn(),
        onCommit: jest.fn(),
        onCancel: jest.fn()
    };
    canvas.moveControlPointGuide = jest.fn();
    canvas.setupControlPointTool();
    return canvas;
};

const keyEvent = (target, key) => ({event: {target}, key, modifiers: {}, stop: jest.fn()});

afterEach(() => {
    paper.tools.slice().forEach(tool => tool.remove());
});

test('toolbar keys do not nudge or cancel the canvas guide', () => {
    const canvas = setup();
    for (const tag of ['button', 'input']) {
        for (const key of ['right', 'escape']) {
            const event = keyEvent(document.createElement(tag), key);
            canvas.controlPointTool.onKeyDown(event);
            expect(event.stop).not.toHaveBeenCalled();
        }
    }
    expect(canvas.currentControlPointGuide.onChange).not.toHaveBeenCalled();
    expect(canvas.currentControlPointGuide.onCancel).not.toHaveBeenCalled();
    canvas.controlPointTool.onKeyDown(keyEvent(canvas.canvas, 'right'));
    expect(canvas.currentControlPointGuide.onChange).toHaveBeenCalledTimes(1);
    expect(canvas.currentControlPointGuide.onCommit).toHaveBeenCalledTimes(1);
});

test('Escape ends the drag and restores the cursor while the guide stays open', () => {
    const canvas = setup();
    canvas.controlPointDrag = {name: 'start', point: [0, 0]};
    canvas.canvas.style.cursor = 'grabbing';
    canvas.controlPointTool.onKeyDown(keyEvent(canvas.canvas, 'escape'));
    expect(canvas.controlPointDrag).toBeNull();
    expect(canvas.canvas.style.cursor).toBe('default');
    expect(canvas.currentControlPointGuide.onCancel).toHaveBeenCalledTimes(1);
    expect(canvas.currentControlPointGuide.onCommit).not.toHaveBeenCalled();
});
