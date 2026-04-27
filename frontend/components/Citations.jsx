export default function Citations({citations}) {
    if (!citations || citations.length === 0) {
        return (
            <div className="citations-bar">
                <h3>Sources and Citations</h3>
                <p>Click "Show Sources" on a response.</p>
            </div>
    )}

    let citationList = [];
    for (let i = 0; i < citations.length; i++) {
        const c = citations[i];

        citationList.push(
            <div key={i}>
                <p><strong>{c[0]}</strong></p>
                <p>{c[1]}</p>
                <a href={c[3]} target="_blank">{c[3]}</a>
            </div>
        );
    }

    return (
        <div className = 'citations-bar' style={{ width: "20%" }}>

        <h3>Sources and Citations</h3>
            {citationList}
        </div>
    )
}