import {useContext, useEffect, useRef} from "react";
import {RoomBuilderContext} from "./RoomBuilderContext.tsx";
import RoomBuilder from "./RoomBuilder.tsx";

export default function ZoomContainer() {
    const {state, dispatch} = useContext(RoomBuilderContext)


    const draggableContainerRef = useRef<HTMLDivElement>(null)

    const isDragging = useRef(false);

    const zoomLevelRef = useRef(state.zoomLevel)
    const frameId = useRef(0);
    const lastX = useRef(0);
    const lastY = useRef(0);
    const dragX = useRef(0);
    const dragY = useRef(0);

    const requestUpdateTransform = () => {
        cancelAnimationFrame(frameId.current)
        frameId.current = requestAnimationFrame(updateTransform);
    }

    const updateTransform = () => {
        if (draggableContainerRef.current) {
            draggableContainerRef.current.style.transform = `translate3d(${dragX.current}px, ${dragY.current}px, 0) scale(${zoomLevelRef.current})`;
        }
    };

    const handleMove = (e: MouseEvent) => {
        if (!isDragging.current) {
            return;
        }

        const deltaX = lastX.current - e.pageX;
        const deltaY = lastY.current - e.pageY;

        lastX.current = e.pageX;
        lastY.current = e.pageY;

        dragX.current -= deltaX;
        dragY.current -= deltaY;

        requestUpdateTransform()
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if((e.target as HTMLDivElement).classList.contains("room")) return;

        lastX.current = e.pageX;
        lastY.current = e.pageY;

        isDragging.current = true
    };

    const handleMouseUp = () => {
        isDragging.current = false
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation()

        const isPinch = e.ctrlKey

        if (isPinch) {
            //TODO change transform origin (to pointer position)
            dispatch({
                type: "CHANGE_ZOOM_BY",
                payload: -Math.floor(e.deltaY * 1000) / 1000 / 10
            })
            return
        }

        dragX.current -= e.deltaX
        dragY.current -= e.deltaY

        requestUpdateTransform();
    }

    /**
     *
     */
    useEffect(() => {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('blur', handleMouseUp);
        document.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('blur', handleMouseUp);
            document.removeEventListener('wheel', handleWheel);
        };
    }, []);

    useEffect(() => {
        if(draggableContainerRef.current == undefined) return;

        draggableContainerRef.current!.style.transition = "all .3s";
        zoomLevelRef.current = state.zoomLevel
        updateTransform()

        setTimeout(() => {
            zoomLevelRef.current = state.zoomLevel
            draggableContainerRef.current!.style.transition = "none"
        }, 300)
    }, [state.zoomLevel]);

    return (
        <div
            onMouseDown={handleMouseDown}
            className="w-full h-full overflow-clip"
        >
            <RoomBuilder ref={draggableContainerRef}/>
        </div>
    )
}