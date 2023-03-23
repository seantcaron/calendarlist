<?php

//
// Updated hook handler for current MediaWiki conventions - Sean Caron - 3/18/2023
//

namespace MediaWiki\Extension\CalendarList;

class Hooks implements \MediaWiki\Hook\BeforePageDisplayHook {

     // @see https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
     // @param \OutputPage $out
     // @param \Skin $skin

    public function onBeforePageDisplay( $out, $skin ): void {
	$out->addModules('ext.CalendarList');

        return;
    }
}
?>

