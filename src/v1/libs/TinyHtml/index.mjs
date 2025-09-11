///////////////////////////////////////////////////

import TinyHtmlButtonInput from './input/button/TinyHtmlButtonInput.mjs';
import TinyHtmlResetInput from './input/button/TinyHtmlResetInput.mjs';
import TinyHtmlSubmitInput from './input/button/TinyHtmlSubmitInput.mjs';

/////////////////////////////////////////////////////

import TinyHtmlNumberInput from './input/number/TinyHtmlNumberInput.mjs';
import TinyHtmlRangeInput from './input/number/TinyHtmlRangeInput.mjs';

//////////////////////////////////////////////////

import TinyHtmlEmailInput from './input/text/TinyHtmlEmailInput.mjs';
import TinyHtmlPasswordInput from './input/text/TinyHtmlPasswordInput.mjs';
import TinyHtmlSearchInput from './input/text/TinyHtmlSearchInput.mjs';
import TinyHtmlTelInput from './input/text/TinyHtmlTelInput.mjs';
import TinyHtmlTextInput from './input/text/TinyHtmlTextInput.mjs';
import TinyHtmlUrlInput from './input/text/TinyHtmlUrlInput.mjs';

//////////////////////////////////////////////////////

import TinyHtmlColorInput from './input/TinyHtmlColorInput.mjs';
import TinyHtmlFileInput from './input/TinyHtmlFileInput.mjs';
import TinyHtmlHiddenInput from './input/TinyHtmlHiddenInput.mjs';

////////////////////////////////////////////////////

import TinyHtmlAudio from './media/TinyHtmlAudio.mjs';
import TinyHtmlButton from './TinyHtmlButton.mjs';
import TinyHtmlCanvas from './TinyHtmlCanvas.mjs';
import TinyHtmlEmbed from './TinyHtmlEmbed.mjs';
import TinyHtmlForm from './TinyHtmlForm.mjs';
import TinyHtmlIcon from './TinyHtmlIcon.mjs';
import TinyHtmlIframe from './TinyHtmlIframe.mjs';
import TinyHtmlImage from './TinyHtmlImage.mjs';
import TinyHtmlInput from './TinyHtmlInput.mjs';
import TinyHtmlLink from './TinyHtmlLink.mjs';
import TinyHtmlObject from './TinyHtmlObject.mjs';
import TinyHtmlSelect from './TinyHtmlSelect.mjs';
import TinyHtmlTextarea from './TinyHtmlTextarea.mjs';
import TinyHtmlVideo from './media/TinyHtmlVideo.mjs';
import TinyHtmlMedia from './TinyHtmlMedia.mjs';

///////////////////////////////////////////////////

import TinyHtmlTemplate from './TinyHtmlTemplate.mjs';

///////////////////////////////////////////////////

class TinyHtmlElems {
  static #list = [
    TinyHtmlButtonInput,
    TinyHtmlResetInput,
    TinyHtmlSubmitInput,
    /////////////////////////////////////////////////////
    TinyHtmlNumberInput,
    TinyHtmlRangeInput,
    //////////////////////////////////////////////////
    TinyHtmlEmailInput,
    TinyHtmlPasswordInput,
    TinyHtmlSearchInput,
    TinyHtmlTelInput,
    TinyHtmlTextInput,
    TinyHtmlUrlInput,
    //////////////////////////////////////////////////////
    TinyHtmlColorInput,
    TinyHtmlFileInput,
    TinyHtmlHiddenInput,
    ////////////////////////////////////////////////////
    TinyHtmlAudio,
    TinyHtmlButton,
    TinyHtmlCanvas,
    TinyHtmlEmbed,
    TinyHtmlForm,
    TinyHtmlIcon,
    TinyHtmlIframe,
    TinyHtmlImage,
    TinyHtmlInput,
    TinyHtmlLink,
    TinyHtmlObject,
    TinyHtmlSelect,
    TinyHtmlTextarea,
    TinyHtmlVideo,
    TinyHtmlMedia,
    ////////////////////////////////////////////////////
    TinyHtmlTemplate,
  ];

  static get list() {
    return [...this.#list];
  }

  static ButtonInput = TinyHtmlButtonInput;
  static ResetInput = TinyHtmlResetInput;
  static SubmitInput = TinyHtmlSubmitInput;

  /////////////////////////////////////////////////////
  static NumberInput = TinyHtmlNumberInput;
  static RangerInput = TinyHtmlRangeInput;

  //////////////////////////////////////////////////

  static EmailInput = TinyHtmlEmailInput;
  static PasswordInput = TinyHtmlPasswordInput;
  static SearchInput = TinyHtmlSearchInput;
  static TelInput = TinyHtmlTelInput;
  static TextInput = TinyHtmlTextInput;
  static UrlInput = TinyHtmlUrlInput;

  //////////////////////////////////////////////////////

  static ColorInput = TinyHtmlColorInput;
  static FileInput = TinyHtmlFileInput;
  static HiddenInput = TinyHtmlHiddenInput;

  ////////////////////////////////////////////////////

  static Audio = TinyHtmlAudio;
  static Button = TinyHtmlButton;
  static Canvas = TinyHtmlCanvas;
  static Embed = TinyHtmlEmbed;
  static Form = TinyHtmlForm;
  static Icon = TinyHtmlIcon;
  static Iframe = TinyHtmlIframe;
  static Img = TinyHtmlImage;
  static Input = TinyHtmlInput;
  static Link = TinyHtmlLink;
  static Object = TinyHtmlObject;
  static Select = TinyHtmlSelect;
  static Textarea = TinyHtmlTextarea;
  static Video = TinyHtmlVideo;
  static Media = TinyHtmlMedia;

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
  TinyHtmlButtonInput,
  TinyHtmlResetInput,
  TinyHtmlSubmitInput,
  /////////////////////////////////////////////////////
  TinyHtmlNumberInput,
  TinyHtmlRangeInput,
  //////////////////////////////////////////////////
  TinyHtmlEmailInput,
  TinyHtmlPasswordInput,
  TinyHtmlSearchInput,
  TinyHtmlTelInput,
  TinyHtmlTextInput,
  TinyHtmlUrlInput,
  //////////////////////////////////////////////////////
  TinyHtmlColorInput,
  TinyHtmlFileInput,
  TinyHtmlHiddenInput,
  ////////////////////////////////////////////////////
  TinyHtmlAudio,
  TinyHtmlButton,
  TinyHtmlCanvas,
  TinyHtmlEmbed,
  TinyHtmlForm,
  TinyHtmlTemplate,
  TinyHtmlIcon,
  TinyHtmlIframe,
  TinyHtmlImage,
  TinyHtmlInput,
  TinyHtmlLink,
  TinyHtmlObject,
  TinyHtmlSelect,
  TinyHtmlTextarea,
  TinyHtmlVideo,
  TinyHtmlMedia,
};
 */
