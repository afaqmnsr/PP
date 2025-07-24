import { Stage, Layer, Text, Rect } from 'react-konva';

export default function CanvasDesigner({ template }) {
    return (
        <Stage width={500} height={300}>
            <Layer>
                {template.elements.map((el, i) =>
                    el.type === 'text' ? (
                        <Text key={i} text={el.text} x={el.x} y={el.y} fontSize={el.fontSize || 12} />
                    ) : el.type === 'qrcode' ? (
                        <Rect key={i} x={el.x} y={el.y} width={el.size} height={el.size} stroke="black" />
                    ) : null
                )}
            </Layer>
        </Stage>
    );
}
