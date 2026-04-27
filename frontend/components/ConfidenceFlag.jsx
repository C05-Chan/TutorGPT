export default function ConfidenceFlag({ confidence }) {
    const score = parseInt(confidence)
    return (
        <span className={score < 8 ? "flag-low" : "flag-high"}>🚩</span>
    )
}