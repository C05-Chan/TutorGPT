
function validateFile(file, setError) {
    // this function validates the file type and size

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

function handleFile(file, setFileSelected, setError) {
    /// this function calls the file type and then sets the file
    if (!file) {
        return
    }

    if (validateFile(file, setError)) {
        setFileSelected(file)
        return 
    }
}

export default function FileUploader({ setFileSelected, setError }) {
    return (
        <div className="file-uploader">
            <input type="file" accept=".txt"
                onChange={(event) => {
                    const file = event.target.files[0]
                    handleFile(file, setFileSelected, setError)
                }}
            />
        </div>
    )
}