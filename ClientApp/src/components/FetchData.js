import React, { Component } from 'react';

export class FetchData extends Component {
  constructor(props) { super(props); this.state = { uploadedImageUrl: '' }; this.fileInput = React.createRef(); }

  handleFileUpload = async (event) => {
    event.preventDefault();
    const file = this.fileInput.current.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        const response = await fetch('weatherforecast/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64String }) });

        if (response.ok) { const data = await response.json(); const url = `data:image/png;base64,${data.base64String}`; this.setState({ uploadedImageUrl: url });
        } else { alert('File upload failed'); }
      };

      reader.readAsDataURL(file);
    }
  };

  render() {
    return (
      <>
        <form onSubmit={this.handleFileUpload}>
          <input type="file" ref={this.fileInput} />
          <button type="submit">送信！</button>
        </form>
        {this.state.uploadedImageUrl && (
          <img src={this.state.uploadedImageUrl} alt="Uploaded" />
        )}
      </>
    );
  }
}
