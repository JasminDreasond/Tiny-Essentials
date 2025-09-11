///////////////////////////////////////////////////

import TinyButtonInput from './input/button/TinyButtonInput.mjs';
import TinyResetInput from './input/button/TinyResetInput.mjs';
import TinySubmitInput from './input/button/TinySubmitInput.mjs';

/////////////////////////////////////////////////////

import TinyNumberInput from './input/number/TinyNumberInput.mjs';
import TinyRangeInput from './input/number/TinyRangeInput.mjs';

//////////////////////////////////////////////////

import TinyEmailInput from './input/text/TinyEmailInput.mjs';
import TinyPasswordInput from './input/text/TinyPasswordInput.mjs';
import TinySearchInput from './input/text/TinySearchInput.mjs';
import TinyTelInput from './input/text/TinyTelInput.mjs';
import TinyTextInput from './input/text/TinyTextInput.mjs';
import TinyUrlInput from './input/text/TinyUrlInput.mjs';

//////////////////////////////////////////////////////

import TinyColorInput from './input/TinyColorInput.mjs';
import TinyFileInput from './input/TinyFileInput.mjs';
import TinyHiddenInput from './input/TinyHiddenInput.mjs';

////////////////////////////////////////////////////

import TinyAudio from './TinyAudio.mjs';
import TinyButton from './TinyButton.mjs';
import TinyCanvas from './TinyCanvas.mjs';
import TinyEmbed from './TinyEmbed.mjs';
import TinyForm from './TinyForm.mjs';
import TinyIcon from './TinyIcon.mjs';
import TinyIframe from './TinyIframe.mjs';
import TinyImage from './TinyImage.mjs';
import TinyInput from './TinyInput.mjs';
import TinyLink from './TinyLink.mjs';
import TinyObject from './TinyObject.mjs';
import TinySelect from './TinySelect.mjs';
import TinyTextarea from './TinyTextarea.mjs';
import TinyVideo from './TinyVideo.mjs';
import TinyMedia from './TinyMedia.mjs';

///////////////////////////////////////////////////

import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

///////////////////////////////////////////////////

class TinyHtmlElems {
  static #list = [
    TinyButtonInput,
    TinyResetInput,
    TinySubmitInput,
    /////////////////////////////////////////////////////
    TinyNumberInput,
    TinyRangeInput,
    //////////////////////////////////////////////////
    TinyEmailInput,
    TinyPasswordInput,
    TinySearchInput,
    TinyTelInput,
    TinyTextInput,
    TinyUrlInput,
    //////////////////////////////////////////////////////
    TinyColorInput,
    TinyFileInput,
    TinyHiddenInput,
    ////////////////////////////////////////////////////
    TinyAudio,
    TinyButton,
    TinyCanvas,
    TinyEmbed,
    TinyForm,
    TinyIcon,
    TinyIframe,
    TinyImage,
    TinyInput,
    TinyLink,
    TinyObject,
    TinySelect,
    TinyTextarea,
    TinyVideo,
    TinyMedia,
    ////////////////////////////////////////////////////
    TinyHtmlTemplate,
  ];

  static get list() {
    return [...this.#list];
  }

  static ButtonInput = TinyButtonInput;
  static ResetInput = TinyResetInput;
  static SubmitInput = TinySubmitInput;

  /////////////////////////////////////////////////////
  static NumberInput = TinyNumberInput;
  static RangerInput = TinyRangeInput;

  //////////////////////////////////////////////////

  static EmailInput = TinyEmailInput;
  static PasswordInput = TinyPasswordInput;
  static SearchInput = TinySearchInput;
  static TelInput = TinyTelInput;
  static TextInput = TinyTextInput;
  static UrlInput = TinyUrlInput;

  //////////////////////////////////////////////////////

  static ColorInput = TinyColorInput;
  static FileInput = TinyFileInput;
  static HiddenInput = TinyHiddenInput;

  ////////////////////////////////////////////////////

  static Audio = TinyAudio;
  static Button = TinyButton;
  static Canvas = TinyCanvas;
  static Embed = TinyEmbed;
  static Form = TinyForm;
  static Icon = TinyIcon;
  static Iframe = TinyIframe;
  static Img = TinyImage;
  static Input = TinyInput;
  static Link = TinyLink;
  static Object = TinyObject;
  static Select = TinySelect;
  static Textarea = TinyTextarea;
  static Video = TinyVideo;
  static Media = TinyMedia;

  ////////////////////////////////////////////////////

  static Element = TinyHtmlTemplate;

  ////////////////////////////////////////////////////

  constructor() {
    throw new Error('Forbidden!!!');
  }
}

export default TinyHtmlElems;

/**
export {
  TinyButtonInput,
  TinyResetInput,
  TinySubmitInput,
  /////////////////////////////////////////////////////
  TinyNumberInput,
  TinyRangeInput,
  //////////////////////////////////////////////////
  TinyEmailInput,
  TinyPasswordInput,
  TinySearchInput,
  TinyTelInput,
  TinyTextInput,
  TinyUrlInput,
  //////////////////////////////////////////////////////
  TinyColorInput,
  TinyFileInput,
  TinyHiddenInput,
  ////////////////////////////////////////////////////
  TinyAudio,
  TinyButton,
  TinyCanvas,
  TinyEmbed,
  TinyForm,
  TinyHtmlTemplate,
  TinyIcon,
  TinyIframe,
  TinyImage,
  TinyInput,
  TinyLink,
  TinyObject,
  TinySelect,
  TinyTextarea,
  TinyVideo,
  TinyMedia,
};
 */
