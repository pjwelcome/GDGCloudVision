//
//  ViewController.swift
//  GDGCloudVision
//
//  Created by pjapple on 2018/02/04.
//  Copyright © 2018 Multimeleon. All rights reserved.
//

import UIKit
import FirebaseStorage
import FirebaseFirestore

class ViewController: UIViewController {
    
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var resultsTextView: UITextView!
    let imagePicker = UIImagePickerController()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        imagePicker.delegate = self
    }
    
    @IBAction func UploadPhotoButton(_ sender: UIButton) {
        imagePicker.sourceType = .photoLibrary
        present(imagePicker, animated: true)
        self.addListenerForResults()
    }
    
    private func addListenerForResults(){
        Firestore.firestore().collection("images").document("image.jpg")
            .addSnapshotListener { documentSnapshot, error in
                if let error = error {
                    print("error occurred\(error)")
                } else {
                    if let exists = documentSnapshot?.exists, exists {
                        self.parseVisionResponse(data: documentSnapshot?.data())
                    } else {
                        print("waiting for Vision API data...")
                    }
                }
        }
    }
    
    fileprivate func getStorageReference(with imageName: String) -> StorageReference {
        return  Storage.storage().reference().child(imageName)
    }
    
    func parseVisionResponse(data: [String: Any]?) {
        guard let data = data else { return }
        
        let entities = data["webEntities"] as? NSArray ?? []
        var entitiesArr = [String]()
        entities.forEach {
            entity in
            let object = entity as? NSDictionary ?? [:]
            let entityName = object["description"] as? String ?? ""
            entitiesArr.append(entityName)
        }
        resultsTextView.text = "Entities found: \(entitiesArr.joined(separator: ", "))"
    }
}

extension ViewController : UIImagePickerControllerDelegate,
UINavigationControllerDelegate  {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        let imageUrl = info[UIImagePickerControllerImageURL] as? URL
        guard let url = imageUrl else {
            dismiss(animated: true, completion: nil)
            return
        }
        imageView.contentMode = .scaleAspectFit
        imageView.image = info[UIImagePickerControllerOriginalImage] as? UIImage
        self.getStorageReference(with: "images/image.jpg").putFile(from: url, metadata: nil) { metadata, error in
            if let error = error {
                print(error)
            } else {
                print("upload success!")
            }
        }
        dismiss(animated: true, completion: nil)
    }
}

