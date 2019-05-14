# vue-drop-zone

A vue component for drag'n'drop upload using uppy.io.

## Installation

```
yarn add @4tw/vue-drop-zone
```

## Usage

Wrap the component you want to be droppable with the `DropZone` component.
Use the `v-model` binding to display a list of all the files.
The files list also includes the progess and other metadata.

``` html
<DropZone>
  <div
      id="this-is-droppable"
      v-model="files"></div>
</DropZone>
<ul>
  <li v-for="file in files">
    {{ file.name }}
  </li>
</ul>
```

``` javascript
import DropZone from '@4tw/vue-drop-zone'

{
  name: 'MyDropZone',
  data() {
    return { files: [] };
  },
  components: { DropZone }
}
```

### Properties

- endpoint[String:document.URL]: Describes the endpoint where the dropzone should upload the files to
- mode[String:'TUS']: Describes the uploader to be used. Can either be 'TUS' or 'XHR'.
- options[Object:{}]: The object can contain of two keys. `uppy` for the uppy client options (https://uppy.io/docs/uppy/#Options), `uploader` for the uploader options (XHR: https://uppy.io/docs/xhr-upload/#Options), (https://uppy.io/docs/tus/#Options)
- v-model[Array:[]]: Use the v-model to have a list of uppy files in the current state (https://uppy.io/docs/uppy/#uppy-getFile-fileID)
- file-browser[Boolean:false]: Define if the dropzone should also be clickable to allow the user
to select the files using the native file browser.

### Uppy Client

The client sits on every drop-zone instance and can be retrieved using a ref:

``` html
<DropZone ref="dropzone" />
```

``` javascript
this.$refs.dropzone.client.uppy.pauseAll();
this.$refs.dropzone.client.uppy.retryAll();
```

See https://uppy.io/docs/uppy/#Methods for all the available methods.
It is not recommended to mess with the plugins.
Also try to avoid using `close` and `reset`. The state of the client is managed
by the client itself.

### Events

- entered: Triggers when the mouse pointer enters the dropping area
- left: Triggers when the mouse poiter has left the dropping area
- dropped: Triggers when the files are dropped
- success: Triggers when the upload successfully finished
- error(File file): Triggers when the upload fails. Also provides the file
that failed the first as an event argument.

## Development
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

## Release

```
yarn run release
```
