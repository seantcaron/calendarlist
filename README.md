# CalendarList

### About

This extension changes a bulleted list of links that include dates
in their names to a calendar layout.

### Installation

Create a CalendarList directory in the extensions directory of your MediaWiki instance.

Clone this repo and copy the files into the extensions/CalendarList directory.

Add the following to LocalSettings.php:

```
wfLoadExtension('CalendarList');
```

### Usage
To enable this layout, you need to wrap the list of documents
in a div with a class of "calendarlist". For example:

```
<div class="calendarlist">
* [[Minutes of 29 November 2011]]
* [[Minutes of 6 December 2011]]
* [[Minutes of 21 December 2011]]
</div>
```

Currently this plugin only recognizes dates in the form
"Date MonthName Year".

If a date it not found in the title of the page, then
the link will not be displayed in the calendar.

Currently only one link can be displayed for a given date.

### Credits

Originally developed by Matthew Flickinger

Presently maintained by Sean Caron

