import { FlagIcon, FlagWarningIcon } from "./Icons.jsx"

export default function ConfidenceFlag({ confidence }) {
    console.log("confidence value:", confidence, typeof confidence)  

    const score = parseInt(confidence) // this changes confidence to an integer
    // console.log(score)
    
    if (score >= 8) { // if the confidence score is higher than 8

        return (
            <span className="high-confidence"><FlagIcon/></span>
        )
    } else {

        return (
            <span className="low-confidence"><FlagWarningIcon/> Response confidence is low! Advise to do more research.</span>
        )
    }
}
