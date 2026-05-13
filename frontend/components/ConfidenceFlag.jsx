import { FlagIcon, FlagWarningIcon } from "./Icons.jsx"

export default function ConfidenceFlag({ confidence }) {
    const score = parseInt(confidence) // this changes confidence to an integer
    // console.log(score)
    
    if (score >= 8) {
        return (
            <span className="high-confidence"><FlagIcon/></span>
        )
    }

    return (
        <span className="low-confidence"><FlagWarningIcon/> Confidence is low, advise to do more research.</span>
    )
}