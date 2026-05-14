export default function Citations({citations}) {

    // this displays the citations on the left side of the chat page
    console.log("citations:", citations)

    if (!citations || citations.length === 0) {  // this checks if the citation is null, undefined or empty resulting to a default instruction display
        return (
            <div className="citations-bar">
                <h3>Sources and Citations</h3>
                <p>Click "Show Sources" on a response.</p>
            </div>
    )}

    if (citations[0] === "empty") { // this is a special check where it the is genuinely no source even when user clicks button, it changes the display
        // "empty" is assigned to the citation list when the button refer to 'utility.jsx'
        return (
            <div className="citations-bar">
                <h3>Sources and Citations</h3>
                <p>No citations or sources available.</p>
            </div>
        )
    }

    let citationList = [] 

    for (let i = 0; i < citations.length; i++) { 
        // for every citation in the length of the citation array, it creates a container for the citation and appends it to the list
        const c = citations[i]

        let citationLink = null

        if (c[2] === 'Uploaded Document') {
            // checks if citation is a uploaded document or website

            citationLink = <a href={c[3]} download>Download Document</a>
        } else {
            citationLink = <a href={c[3]} target="_blank">Visit Source</a>
        }

        citationList.push(
            <div className='citation-container' key={i}>
                <p className='citation-title'>{c[0]}:</p>
                <p>{c[1]}</p>
                {citationLink}
            </div>
        )
    }

    return (
        <div className = 'citations-bar'>
            <h3>Sources and Citations</h3>
            {citationList}
        </div>
    )
}