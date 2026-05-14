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
            // checks if citation is a uploaded document 
            const chatSessionID = localStorage.getItem("chatSessionID")
            citationLink = <a href={`/api/getfile?chatSessionID=${chatSessionID}`} download>Download Document</a> // makes the link a downloadable file

        } else {
            citationLink = <a href={c[3]} target="_blank">Visit Source</a> // normal link
        }

        citationList.push( // add the citation container into the list 
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