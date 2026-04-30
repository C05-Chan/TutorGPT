import { House, Trash2, Settings, CircleUserRound, SendHorizontal, Flag, FlagOff} from "lucide-react"

export function HouseIcon() {
    return <House size={32} />
}

export function SettingsIcon() {
    return <Settings size={32} />
}

export function LoginIcon() {
    return <CircleUserRound size={32} />
}

export function TrashIcon() {
    return <Trash2 size={25} />
}

export function SendIcon() {
    return <SendHorizontal size={22}/>
}

export function FlagWarningIcon() {
    return <Flag size={25}/>
}

export function FlagIcon() {
    return <FlagOff size={25}/>
}