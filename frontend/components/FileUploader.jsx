
function validateFile(file, setError) {
    if (file.size > 5000) {
        setError("File is too large. Max 5kb.")
        return false
    } else if (file.type !== "text/plain") {
        setError("Only .txt files are allowed.")
        return false
    }

    setError("")
    return true
}

export default function FileUploader({ fileSelected, setFileSelected, setError }) {

    let selectedText = null

    if (fileSelected) {
        selectedText = <p>Selected: {fileSelected.name}</p>
    }

    return (
        <div className="file-uploader">
            <input type="file" accept=".txt"
                onChange={(event) => {
                    const file = event.target.files[0]
                    if (!file) {
                        return
                    }

                    if (validateFile(file, setError)) {
                        setFileSelected(file)
                    } else {
                        event.target.value = ""
                    }
                }
            }
            />

            {selectedText}
        </div>
    )
}