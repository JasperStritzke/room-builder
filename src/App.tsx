import {ReactNode, useContext} from "react";
import {
    CopyIcon, MinusIcon, MousePointer2Icon, PlusCircleIcon,
    PlusIcon, RedoIcon,
    Trash2Icon,
    UndoIcon
} from "lucide-react";
import ZoomContainer from "./ZoomContainer.tsx";
import {cn} from "./lib/utils.ts";
import {RoomBuilderContext, RoomBuilderProvider, RoomBuilderToolType} from "./RoomBuilderContext.tsx";

function App() {
    return (
        <RoomBuilderProvider>
            <ToolsBar/>
            <ControlWidget/>
            <ZoomContainer/>
        </RoomBuilderProvider>
    )
}


function ToolsBar() {
    return (
        <div
            className="fixed top-1/2 right-5 z-10 flex -translate-y-1/2 flex-col items-center justify-between gap-4 rounded-full bg-zinc-900 px-1 py-1 text-white"
        >
            <ToolsBarElement toolType="POINTER" icon={<MousePointer2Icon size={18}/>}/>
            <ToolsBarElement toolType="ADD" icon={<PlusCircleIcon size={18}/>}/>
            <ToolsBarElement toolType="DELETE" icon={<Trash2Icon size={18}/>}/>
            <ToolsBarElement toolType="DUPLICATE" icon={<CopyIcon size={18}/>}/>
        </div>
    )
}

function ToolsBarElement({icon, toolType}: { icon: ReactNode, toolType: RoomBuilderToolType }) {
    const {state, dispatch} = useContext(RoomBuilderContext)

    return (
        <button
            className={
                cn("active:scale-90 transition-all duration-75 p-3 rounded-full hover:bg-zinc-800",
                    state.tool == toolType && "bg-zinc-700 hover:bg-zinc-700"
                )
            }
            onClick={() => dispatch({type: "CHANGE_TOOL", payload: toolType})}
        >
            {icon}
        </button>
    )
}

function ControlWidget() {
    const {state, dispatch} = useContext(RoomBuilderContext)

    const formattedZoomLevel = `${Math.floor(state.zoomLevel * 100)}%`

    function changeZoomBy(factor: number) {
        return () => {
            dispatch({
                type: "CHANGE_ZOOM_BY",
                payload: factor
            })
        }
    }

    function resetZoom() {
        return dispatch({
            type: "SET_ZOOM_LEVEL",
            payload: 1
        })
    }

    return (
        <div className="fixed right-5 bottom-5 z-10 flex select-none items-center gap-2">
            <div className="flex rounded bg-slate-300 shadow">
                <ControlWidgetOption icon={<UndoIcon/>} onClick={() => {
                }}/>
                <ControlWidgetOption icon={<RedoIcon/>} onClick={() => {
                }}/>
            </div>
            <div className="flex rounded bg-slate-300 shadow">
                <ControlWidgetOption icon={<MinusIcon/>} onClick={changeZoomBy(-0.25)}/>
                <button
                    className="border-r-2 border-l-2 border-slate-400 border-opacity-25 px-4 py-2 font-medium"
                    onClick={resetZoom}
                >
                    {formattedZoomLevel}
                </button>
                <ControlWidgetOption icon={<PlusIcon/>} onClick={changeZoomBy(0.25)}/>
            </div>
        </div>
    )
}

function ControlWidgetOption({icon, onClick}: { icon: ReactNode, onClick: () => void }) {
    return (
        <button className="appearance-none border-none p-2 outline-none hover:bg-slate-200" onClick={onClick}>
            {icon}
        </button>
    )
}

export default App
