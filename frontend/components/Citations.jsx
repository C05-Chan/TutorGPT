export default function Citations({citations}) {
    console.log("citations:", citations)
    if (!citations || citations.length === 0) {
        return (
            <div className="citations-bar">
                <h3>Sources and Citations</h3>
                <p>Click "Show Sources" on a response.</p>
            </div>
    )}

    if (citations[0] === "empty") {
        return (
            <div className="citations-bar">
                <h3>Sources and Citations</h3>
                <p>No citations or sources available.</p>
            </div>
        )
    }

    let citationList = [];
    for (let i = 0; i < citations.length; i++) {
        const c = citations[i];

        citationList.push(
            <div className='citation-container' key={i}>
                <p className='citation-title'>{c[0]}:</p>
                <p>{c[1]}</p>
                <a href={c[3]} target="_blank">{c[3]}</a>
            </div>
        );
    }

    return (
        <div className = 'citations-bar'>
            <h3>Sources and Citations</h3>
            {citationList}
        </div>
    )
}