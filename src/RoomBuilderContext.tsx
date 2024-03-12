import {createContext, Dispatch, ReactNode, useReducer} from "react";
import {clamp} from "./lib/utils.ts";

export type RoomBuilderToolType = "POINTER" | "ADD" | "DELETE" | "DUPLICATE"
type RoomBuilderStateType = {
    tool: RoomBuilderToolType
    zoomLevel: number,
}

export type RoomBuilderStateAction = {
    type: "CHANGE_TOOL",
    payload: RoomBuilderToolType
} | {
    type: "CHANGE_ZOOM_BY" | "SET_ZOOM_LEVEL",
    payload: number
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2

const roomBuilderReducer = (state: RoomBuilderStateType, action: RoomBuilderStateAction) => {
    switch (action.type) {
        case "CHANGE_TOOL":
            return {
                ...state,
                tool: action.payload
            }
        case "SET_ZOOM_LEVEL":
            return {
                ...state,
                zoomLevel: clamp(action.payload, MIN_ZOOM, MAX_ZOOM)
            }
        case "CHANGE_ZOOM_BY":
            return {
                ...state,
                zoomLevel: clamp(state.zoomLevel + action.payload, MIN_ZOOM, MAX_ZOOM)
            }
        default:
            return state;
    }
}

const defaultValue: RoomBuilderStateType = {
    tool: "POINTER",
    zoomLevel: 1
}

const RoomBuilderContext = createContext<{
    state: RoomBuilderStateType,
    dispatch: Dispatch<RoomBuilderStateAction>
}>({
    state: defaultValue,
    dispatch: () => null
})

const RoomBuilderProvider = ({children}: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(roomBuilderReducer, defaultValue);

    return (
        <RoomBuilderContext.Provider value={{state, dispatch}}>
            {children}
        </RoomBuilderContext.Provider>
    )
}

export {RoomBuilderProvider, RoomBuilderContext}