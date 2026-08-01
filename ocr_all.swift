import Foundation
import Vision
import Cocoa

func performOCR(imagePath: String) -> String {
    let url = URL(fileURLWithPath: imagePath)
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        return ""
    }

    var fullText = ""
    let requestHandler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    let request = VNRecognizeTextRequest { (request, error) in
        if let _ = error { return }
        guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
        let recognizedStrings = observations.compactMap { observation in
            return observation.topCandidates(1).first?.string
        }
        fullText = recognizedStrings.joined(separator: "\n")
    }
    
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = true

    do {
        try requestHandler.perform([request])
    } catch { }
    
    return fullText
}

let fileManager = FileManager.default
let currentDir = fileManager.currentDirectoryPath
let imagesDir = "\(currentDir)/biology/suggestions_pages"
let outputFile = "\(currentDir)/biology_full_text.txt"

do {
    let files = try fileManager.contentsOfDirectory(atPath: imagesDir).filter { $0.hasSuffix(".jpg") }.sorted()
    var combinedText = ""
    for (index, file) in files.enumerated() {
        let text = performOCR(imagePath: "\(imagesDir)/\(file)")
        combinedText += "===PAGE \(index + 1)===\n" + text + "\n\n"
    }
    try combinedText.write(toFile: outputFile, atomically: true, encoding: .utf8)
} catch { }
