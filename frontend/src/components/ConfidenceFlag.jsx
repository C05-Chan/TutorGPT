import { FlagIcon, FlagWarningIcon } from "./Icons.jsx"

export default function ConfidenceFlag({ confidence, confidenceReason  }) { 
    console.log("confidence:", confidence, "confidenceReason:", confidenceReason)
    const score = parseInt(confidence) // this changes confidence to an integer
    // console.log(score)
    
    if (score >= 8) { // if the confidence score is higher than 8

        return (
            <span className="high-confidence"><FlagIcon/></span>
        )
    } else {

        return (
            <span className="low-confidence"><FlagWarningIcon/> Response confidence is low! {confidenceReason || "Advise to do more research."}</span>
        )
    }
}
