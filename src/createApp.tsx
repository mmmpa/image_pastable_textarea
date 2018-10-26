import { Component, h, VNode } from 'preact'

type ImageT = {
  type: string
  data: string
}

const sample = 'https://cdn.kibe.la/media/private/4665/W1siZiIsInRlYW1fNDY2NS8yMDE4LzA0LzIzLzVubjAxNGgyOXVfVDAzSDNOUEY0X1UxSjlGUEhLNV84ZjMwMDdmMzhlMmFfMTkyLnBuZyJdLFsicCIsInRodW1iIiwiMTIweDEyMCMiXV0/097d9610f91b3a77/T03H3NPF4-U1J9FPHK5-8f3007f38e2a-192.png'

class App extends Component {
  pasteArea: HTMLDivElement

  onChange = (e) => this.setState({ message: e.target.value })
  onPaste = async (rawEvent: Event) => {
    const event = rawEvent as ClipboardEvent
    const { items } = event.clipboardData

    if (!items) {
      // paste 用エリアを示す
      return false
    }

    const pasted = Array.from(items).filter(o => o.kind === 'file')

    if (pasted.length === 0) {
      return
    }

    event.preventDefault()
    const results: any = await Promise.all(pasted.map(this.upload))

    this.setState({
      images: this.state.images.concat(results.filter(o => o))
    })
  }

  state = {
    images: [],
    message: '',
  }

  async upload (file): Promise<ImageT | void> {
    const reader = new FileReader()
    const read = new Promise<ProgressEvent>((resolve, reject) => {
      reader.onload = resolve
      reader.onerror = resolve
    })
    reader.readAsDataURL(file.getAsFile())
    try {
      const { result } = (await read).target as FileReader
      return { type: 'pasted', data: result as string }
    } catch (e) {
      return void(0)
    }
  }

  attachOnChange = async (e: Event) => {
    const { files } = e.target as HTMLInputElement
    const results: any = await Promise.all(
      Array.from(files || []).map(async (file) => {
        const reader = new FileReader()
        const read = new Promise<ProgressEvent>((resolve, reject) => {
          reader.onload = resolve
          reader.onerror = reject
        })
        reader.readAsDataURL(file)
        try {
          const { result } = (await read).target as FileReader
          return { type: 'attached', data: result as string }
        } catch (e) {
          return void(0)
        }
      })
    )

    this.setState({
      images: this.state.images.concat(results.filter(o => o))
    })
  }

  onPasteSpecial = (e) => {
    console.log(e)
    setTimeout(this.onProcessImage)

  }

  onProcessImage = () => {
    const images = this.pasteArea.querySelectorAll('img')
    Array.from(images).forEach((image) => {
      console.log(image.src)
    })

    this.pasteArea.innerText = 'paste area'
  }

  render () {
    const {
      message,
      images,
    } = this.state

    return (
      <div className="row" >
        <div className="col-sm" >
          <textarea
            className="form-control"
            contentEditable={true}
            onPaste={this.onPaste}
            onChange={this.onChange}
            value={message}
          />
          <div
            contentEditable={true}
            onPaste={this.onPasteSpecial}
          >
            <h1 ref={c => this.pasteArea = c}>paste area</h1>
          </div>
          <div >
            <label
              for="attacher"
              className="btn btn-success"
            >attach</label >
            <div style={{ width: 0, overflow: 'hidden' }} >
              <input type="file" id="attacher" onChange={this.attachOnChange} />
            </div >
            <h2 >sample for copy and paste</h2 >
            <img src={sample} />
          </div >
        </div >
        <PastedImageList value={images} />
      </div >
    )
  }
}

function PastedImageList ({ value }): VNode<any> {
  return (
    <div className="col-sm" >
      <ul >
        {value.map(image => <PastedImageListItem value={image} />)}
      </ul >
    </div >
  )
}

function PastedImageListItem ({ value }): VNode<any> {
  return (
    <li >
      <img src={value.data} style={{ maxWidth: 80, maxHeight: 80 }} />
      <h2 style={{ display: 'inline-block', marginLeft: 5 }} >: {value.type}</h2 >
    </li >
  )
}

export function createApp () {
  return <div className="container" >
    <h1 >paste</h1 >
    <App />
  </div >
}
