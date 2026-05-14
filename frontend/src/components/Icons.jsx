import { House, Trash2, Settings, CircleUserRound, SendHorizontal, Flag, FlagOff} from "lucide-react" // import icons from lucide react (an icon library)


export function HouseIcon() {
    // Home button icon
    return <House size={32} />
}

export function SettingsIcon() {
    // Setting button icon
    return <Settings size={32} />
}

export function LoginIcon() {
    // Login button icon
    return <CircleUserRound size={32} />
}

export function TrashIcon() {
    // Trash button icon
    return <Trash2 size={25} />
}

export function SendIcon() {
    // Send button icon
    return <SendHorizontal size={22}/>
}

export function FlagWarningIcon() {
    // Flag On button icon
    return <Flag size={25}/>
}

export function FlagIcon() {
    // Flag Off button icon
    return <FlagOff size={25}/>
}