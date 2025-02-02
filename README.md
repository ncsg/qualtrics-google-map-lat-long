# Qualtrics Google Map Lat/Long Collector

## NOTE
To use the updated code, you must replace it in all questions in your survey. If an older version of the code is running in another question, the map may not display.

#### Getting Started
Create or open a Qualtrics survey. You must be able to add JavaScript to a question for this code to work (it will not work on trial accounts where this feature is unavailable).

### Header Script

The first step is to add the Google Maps API and this script to your survey's header. See _[Adding a Survey Header/Footer](https://www.qualtrics.com/support/survey-platform/survey-module/look-feel/general-look-feel-settings/#AddFooterHeader)_ on Qualtrics' support site. When you get to the Rich Text Editor, click the <img src="https://cdnjs.cloudflare.com/ajax/libs/ckeditor/4.14.1/plugins/sourcedialog/icons/hidpi/sourcedialog.png" alt="Source Dialog" width="16"/> icon in the toolbar to display HTML. Paste the following at the top of the header:

```html
<script src="https://maps.googleapis.com/maps/api/js?libraries=places&key={YOURKEYHERE}"></script>
```

Make sure to replace the `{YOURKEYHERE}` with your Google Maps API key.

#### Making a Lat/Long Collection Question
Start by making a new _Text Entry_ question. You can treat this question like you would any other (ex. require a response, change the title, etc.). It is recommended that you provide instructions in the question (see _Using the Question_ below).

On the left side of the question, click the gear and select _Add JavaScript..._

Select everything in the box and clear it. The JavaScript box should be empty before pasting the code.

Copy the JavaScript from the [file](https://github.com/pkmnct/qualtrics-google-map-lat-long/blob/master/QualtricsGoogleMapLatLong.js) and paste it in the box.

At the top of the pasted code, find the section labeled _Enter your Google Map API key in this variable._

Replace the text _Your Key_ with your own API key (see the Google Maps documentation _[Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)_).

Scroll down to the section labeled _Variables_ and edit the variables as needed.

Click Save. Test the question before sending out the survey.

#### Using the Question
By default, an autocomplete field is created to assist in finding a location. Responders can enter a location into this field and the map will snap its marker to that location. They can then fine-tune the response by dragging the marker to a specific location (such as a door to a building).

If you would like to disable the autocomplete field, set the variable _enableAutocompleteField_ to _false_. Users can then just drag the pin to the desired location.

The result is collected in the Qualtrics question field as a JSON object. It will be in the format as follows:

`{"lat": "38.8951", "long": "-77.0364"}`
