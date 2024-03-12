import {forwardRef, MutableRefObject, useContext, useEffect, useRef} from "react";
import {RoomBuilderContext, RoomBuilderToolType} from "./RoomBuilderContext.tsx";

import {v4 as uuid} from "uuid"

const ROOM_MIN_WIDTH_HEIGHT = 50
const ROOM_DEFAULT_WIDTH_HEIGHT = 250
const ROOM_SNAP_DISTANCE = 50


class RoomHolder {
    private id: string;

    private posX: number;
    private posY: number;

    private width: number;
    private height: number;

    private isGhost: boolean

    public element: HTMLElement

    private frameId: number = -1;

    private rooms: MutableRefObject<Array<RoomHolder>>

    constructor(posX: number, posY: number, rooms: MutableRefObject<Array<RoomHolder>>) {
        this.id = uuid();

        this.posX = posX;
        this.posY = posY;

        this.width = ROOM_DEFAULT_WIDTH_HEIGHT
        this.height = ROOM_DEFAULT_WIDTH_HEIGHT

        this.isGhost = true

        this.rooms = rooms;


        this.element = this.createRoomElement()
        this.moveTo(this.posX, this.posY)
    }

    transformToReal() {
        this.isGhost = false;
        this.element.setAttribute("class", "room absolute h-96 w-96 rounded border-none p-5 text-center text-white bg-primary flex justify-center items-center select-none")
        this.element.innerHTML = this.id
    }

    createRoomElement() {
        const element = document.createElement("div")
        element.setAttribute("data-room", this.id)

        if (this.isGhost) {
            element.setAttribute("class", "room absolute pointer-events-none h-96 w-96 rounded border-dashed border-2 border-gray-500 opacity-75 flex justify-center items-center select-none")
        }

        element.innerHTML = "+"

        element.style.width = `${this.width}px`
        element.style.height = `${this.height}px`

        document.querySelector("#room-builder-container")!.appendChild(element)
        return element
    }

    moveTo(posX: number, posY: number) {
        //modify posX and posY to snap to nearest object

        const newRect = new DOMRect(
            posX - this.width / 2,
            posY - this.height / 2,
            this.width,
            this.height,
        )

        cancelAnimationFrame(this.frameId)
        this.frameId = requestAnimationFrame(() => {
            this.posX = posX;
            this.posY = posY;

            const centeredY = this.posY - this.height / 2
            const centeredX = this.posX - this.width / 2

            this.element.style.top = `${centeredY}px`
            this.element.style.left = `${centeredX}px`
        })
    }

    isPosInside(posX: number, posY: number): boolean {
        const rect = this.element.getBoundingClientRect()
        return posY >= rect.top && posY <= rect.bottom && posX >= rect.left && posX <= rect.right
    }

    doRectsIntersect(rect1: DOMRect) {
        const rect2 = this.element.getBoundingClientRect()

        if (rect1.right < rect2.left || rect2.right < rect1.left) {
            return false;
        }
        return !(rect1.bottom < rect2.top || rect2.bottom < rect1.top);
    }

    /*
     * idea:
     * 1. calculate vector between both centers
     * 2. calculate angle between x axis and vector
     * 3. use angle to get closest point on both rectangles
     * 4. calculate distance between both points using pythagoras
     */
    calculateSimpleDistance(otherRoom: RoomHolder) {
        return -1;
    }

    destroy() {
        this.element.remove()
    }
}

const RoomBuilder = forwardRef<HTMLDivElement>((_, ref) => {
    const {state, dispatch} = useContext(RoomBuilderContext)

    const toolRef = useRef<RoomBuilderToolType>(state.tool)
    const rooms = useRef<Array<RoomHolder>>([])
    const ghostRef = useRef<RoomHolder | null>(null)

    function summonGhost(posX: number, posY: number) {
        if (ghostRef.current) {
            ghostRef.current.moveTo(posX, posY)
            return
        }

        ghostRef.current = new RoomHolder(posX, posY, rooms)
    }

    function destroyGhost() {
        ghostRef.current?.destroy()
        ghostRef.current = null
    }

    function handleClick(e: React.MouseEvent<HTMLElement>) {
        if ((e.target as HTMLDivElement).classList.contains("room")) {
            const clickedRoom = rooms.current.find(room => room.element === e.target)

            if(clickedRoom && state.tool == "DELETE") {
                clickedRoom.destroy()
                rooms.current = rooms.current.filter(room => room != clickedRoom)
            }
            return
        }

        const target = e.target as HTMLDivElement

        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        //handle backdrop click

        if (state.tool == "ADD") {
            summonGhost(x, y)

            ghostRef.current!.transformToReal();
            rooms.current = [...rooms.current, ghostRef.current!]
            ghostRef.current = null

            dispatch({
                type: "CHANGE_TOOL",
                payload: "POINTER"
            })
        }
    }

    function handleMouseMove(e: MouseEvent) {
        if (toolRef.current == "ADD") {
            const target = e.target as HTMLDivElement

            if (target.id != "room-builder-container" && !target.classList.contains("room")) {
                destroyGhost()
                return
            }

            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            summonGhost(x, y)
        }
    }

    useEffect(() => {
        toolRef.current = state.tool
    }, [state.tool]);

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("blur", destroyGhost)
        document.addEventListener("mouseleave", destroyGhost);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("blur", destroyGhost)
            document.removeEventListener("mouseleave", destroyGhost)
        }
    }, []);

    return (
        <div
            id="room-builder-container"
            ref={ref}
            className="w-full h-full relative  border border-red-500"
            onClick={handleClick}
        />
    )
})

export default RoomBuilder