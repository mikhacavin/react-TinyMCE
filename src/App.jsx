import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import "./App.css";

export default function App() {
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const example_image_upload_handler = (blobInfo, progress) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = false;
      xhr.open(
        "POST",
        `https://www.imghippo.com/v1/upload?api_key=${
          import.meta.env.VITE_IMG_HIPPO_API_KEY
        }`
      );

      xhr.upload.onprogress = (e) => {
        progress((e.loaded / e.total) * 100);
      };

      xhr.onload = () => {
        if (xhr.status === 403) {
          reject({ message: "HTTP Error: " + xhr.status, remove: true });
          return;
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject("HTTP Error: " + xhr.status);
          return;
        }

        //hippo storage
        const raw = JSON.parse(xhr.responseText);
        const json = { location: raw.data.view_url };
        // const json = { location: raw.data.url };
        // console.log(json);

        if (!json || typeof json.location != "string") {
          reject("Invalid JSON: " + xhr.responseText);
          return;
        }

        resolve(json.location);
      };

      xhr.onerror = () => {
        reject(
          "Image upload failed due to a XHR Transport error. Code: " +
            xhr.status
        );
      };

      const formData = new FormData();
      // formData.append("image", blobInfo.blob(), blobInfo.filename());
      formData.append("file", blobInfo.blob(), blobInfo.filename());

      xhr.send(formData);
    });

  return (
    <>
      <Editor
        apiKey="flaslgydxvivestoido2p1wiug67ocqud6p6spipwz26b2yk"
        onInit={(_evt, editor) => (editorRef.current = editor)}
        initialValue="<p>This is the initial content of the editor.</p>"
        init={{
          height: 700,
          width: "100%",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "emoticons",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help ",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          file_picker_types: "file image media",
          images_upload_handler: example_image_upload_handler,
        }}
      />
      <button onClick={log}>Log editor content</button>
    </>
  );
}
