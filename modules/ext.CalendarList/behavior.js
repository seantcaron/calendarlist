$(function() {
    $(".calendarlist").calendarlist();
})

if(!Array.indexOf){
    Array.prototype.indexOf = function(obj){
        for(var i=0; i<this.length; i++){
            if(this[i]==obj){
                return i;
            }
        }
        return -1;
    }
}

if(!Date.clearTime) {
    Date.prototype.clearTime = function() {
        this.setHours(0);
        this.setMinutes(0);
        this.setSeconds(0);
        this.setMilliseconds(0);
        return this;
    }
}
if(!Date.firstDateOfMonth) {
    Date.prototype.firstDateOfMonth = function() {
        this.setDate(1);
        return this;
     }
    Date.prototype.lastDateOfMonth = function() {
        this.setMonth(this.getMonth()+1)
        this.setDate(1);
        this.setDate(this.getDate()-1);
        return this;
    }
    Date.prototype.firstDateOfYear = function() {
        this.setMonth(0);
        this.setDate(1);
        return this;
    }
    Date.prototype.lastDateOfYear = function() {
        this.setMonth(11);
        this.setDate(31);
        return this;
    }
}

if(!Date.clone) {
    Date.prototype.clone = function() {
        return new Date(this.getTime());
    }
}

if(!Date.add) {
    Date.prototype.add = function(val, units) {
        switch (units) {
           case "days":
           case "day":
            this.setDate(this.getDate()+val);
            break;
           case "months":
           case "month":
            this.setMonth(this.getMonth()+val);
            break;
           case "years":
           case "year":
            this.setFullYear(this.getFullYear() + val);
            break;
           default:
            throw new Error("bad units");
        }
        return this;
    }
}
if (!Date.monthNames) {
    Date.monthNames = ["January","February","March","April","May",
        "June","July","August","September","October","November","December"];
    Date.monthAbbrs = ["Jan","Feb","Mar","Apr","May",
        "Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
}

(function ($) {
    $.fn.calendarlist = function() { var newcalid=1; return this.each(function() {
        var $this = $(this);
        if (!$this.attr("id")) {$this.attr("id", "callist"+newcalid++)};
        var $cal = $("<div>").addClass("calendarlist-cal");

        //find data
        function extractDocuments(ele) {
            var $links = ele.find("a");
            var documentList=new Object();
            $links.each(function(idx, val) {
                var title = $(val).attr("title");
                var href = $(val).attr("href");
                var lclass = $(val).attr("class");
                var pubDate = extractDate(title, $(val).text());
                if(pubDate) {
                    documentList[pubDate.toString()] = {href: href, title:title, lclass: lclass, ldate: pubDate};
                    documentList[pubDate.getFullYear()+"-"+pubDate.getMonth()] = 1;
                }
            })
            return(documentList);
        }

        function extractDate() {
            var pat1 =/(\d{1,2})\W+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\W+(\d{4})/i; 
            var pat2 =/(\d{4})(\d{2})(\d{2})/i; 
			for(var i=0, j=arguments.length; i<j; i++) {
				var match = arguments[i].match(pat1);
				if (match) {
					return new Date(match[3], Date.monthAbbrs.indexOf(match[2]), match[1]);
				}
				match = arguments[i].match(pat2);
				if(match) {
					return new Date(match[1], match[2]-1, match[3]);
				}
			}
        }
        var documentList = extractDocuments($this);

        //calendar state
        var viewMode = 0; //0=month, 1=year;
        var firstDate = new Date(), lastDate = new Date(1900,0,1);
        for (var dateName in documentList) {
            if (typeof documentList[dateName] == "object") {
                var walkDate = documentList[dateName].ldate;
                if(walkDate<firstDate) firstDate = walkDate;
                if(walkDate>lastDate) lastDate = walkDate;
            }
        }
        function getcookieid() {return $this.attr('id')+"-state"}
        function initfromcookie() {
            var cookie = $.cookie(getcookieid());
            if(cookie) {
                var info = cookie.split("|");
                if (info.length!=3) {return;}
                var cookieDate = new Date(info[0]);
                var cookieLast = new Date(info[2]);
                if(cookieLast != null && cookieLast.toString() != lastDate.toString()) {
                    return;
                }
                if (cookieDate != null) {
                    currentDate = cookieDate;
                    viewMode = info[1];
                }
            }
        }
        function serializestate() {
            return currentDate.toString() + 
                "|" + viewMode +
                "|" + lastDate.toString();
        }
        var currentDate = lastDate.clone();
        initfromcookie();
        

        //initialize header
        var $nextbutton = $("<button>").text("next").click(function() {move(1)});
        var $prevbutton = $("<button>").text("prev").click(function() {move(-1)});
        var $title = $("<div>").text("calendar").addClass("cal-title").click(switchViewMode);
        $cal.append($("<div>").addClass("cal-header").append(
            $("<div>").addClass("prev").append($prevbutton),
            $title,
            $("<div>").addClass("next").append($nextbutton)
        ))

        //initialize content boxes
        var $body = $("<div>").addClass("cal-body");
        var $box = $("<div>").addClass("box");
        var $boxup = $("<div>").addClass("box-up");
        var $boxleft = $("<div>").addClass("box-left");
        var $boxright = $("<div>").addClass("box-right");
        var $boxdown = $("<div>").addClass("box-down");
        $cal.append($body.append($("<div>").addClass("scroll").append(
            $boxup, $boxleft, $box, $boxright, $boxdown)
        ))

        //initialize footer
        function goToFirst() {setCurrentDate(firstDate); return false;}
        function goToLast() {setCurrentDate(lastDate); return false;}
        $cal.append($("<div>").addClass("cal-footer").append(
            $("<div>").addClass("prev").append($("<a>").click(goToFirst).text("oldest")),
            $("<div>").addClass("cal-title").append($("<a>").click(toggleList).text("list")),
            $("<div>").addClass("next").append($("<a>").click(goToLast).text("newest"))
        ));

        //drawing helper functions
        function swapview(content, fromdir) {
            //0=left, 1=right, 2=top, 3=down;
            var $drawbox = [$boxleft, $boxright, $boxup, $boxdown];
            var boxleft = [0, boxwidth*2, boxwidth, boxwidth];
            var boxtop = [boxheight, boxheight, 0, boxheight*2];
            
            $body.filter("animated").stop(true,true);
            if($box.children().length>0) {
                $drawbox[fromdir].empty().append($box.children());
                $body.scrollLeft(boxleft[fromdir]).scrollTop(boxtop[fromdir]);
                $box.empty().append(content)
                $body.animate({scrollLeft: boxwidth, scrollTop: boxheight}, 300);
            } else {
                $box.append(content)
            }
        }

        function buildmonthtable(year, month) {
            var tbl = $("<tbody>").appendTo($("<table>").addClass("calmonth"));
            var row = $("<tr>").appendTo(tbl);
            var walkDate = new Date(year, month-1, 1);
            walkDate.setDate(walkDate.getDate() - walkDate.getDay());
            for(i=0; i<7*6;i++, walkDate.setDate(walkDate.getDate()+1)) {
                if (row.children().length==7) {
                    row = $("<tr>").appendTo(tbl);
                }
                var cell = $("<td>").text(walkDate.getDate()).appendTo(row);
                if(walkDate.getMonth() != month -1 ) { //| walkDate<firstDate | walkDate>lastDate) {
                    cell.addClass("unavail");
                } else if (walkDate.toString() in documentList) {
                    doc = documentList[walkDate.toString()];
                    cell.addClass("event");
                    var $docLink= $("<a>", {href: doc.href, title: doc.title});
                    if(doc.lclass !=null) $docLink.addClass(doc.lclass);
                    cell.contents().wrap($docLink);
                    cell.click(function() {location.href=$(this).find("a").attr("href")})
                }
            }
            return tbl.parent();
        }

        function buildyeartable(year) {
            var tbl = $("<tbody>").appendTo($("<table>").addClass("calyear"));
            var row = $("<tr>").appendTo(tbl);
            var walkDate = new Date(year, 0, 1);
            for(var i=0; i<12; i++, walkDate.add(1, "month")) {
                if(row.children().length==4) {
                    row = $("<tr>").appendTo(tbl);
                }
                var cell = $("<td>").data("month",i).click(monthclick).text(Date.monthAbbrs[i]).appendTo(row);
                if(lastDate < walkDate | firstDate > walkDate.clone().lastDateOfMonth()) {
                    cell.addClass("unavail");
                } else if (walkDate.getFullYear() +"-"+walkDate.getMonth() in documentList) {
                    cell.addClass("event");
                }
            }
            return tbl.parent();
        }
        function monthclick() {
            var newDate = currentDate.clone()
            newDate.setMonth($(this).data("month"));
            setCurrentDate(newDate, 0);
        }

        //navigation functions
        function move(n) {
            if(viewMode==1) {
                moveyears(n);
            } else {
                movemonths(n);
            }
        }
        function movemonths(n) {setCurrentDate(currentDate.clone().add(n, "month"));}
        function moveyears(n) {setCurrentDate(currentDate.clone().add(n, "year"));}

        function setCurrentDate(newDate, newView) {
            var newc, fromd, title;
            var rangeStart, rangeEnd;
            if($box.children().length!=0 && 
                (newView==undefined || newView==viewMode) &&
                newDate.getFullYear()==currentDate.getFullYear() &&
                ((newView==undefined?viewMode:newView)==1 || newDate.getMonth()==currentDate.getMonth())) {
                return;
            }
            newView = newView==null ? viewMode : newView;
            if(newDate<firstDate) {newDate=firstDate};
            if(newDate>lastDate) {newDate=lastDate};
            if (newView==1)  {
                newc = buildyeartable(newDate.getFullYear());
                title = newDate.getFullYear();
                rangeStart = newDate.clone().firstDateOfYear(); 
                rangeEnd = newDate.clone().lastDateOfYear(); 
            } else if (newView==0) {
                newc = buildmonthtable(newDate.getFullYear(), newDate.getMonth()+1);
                title = Date.monthAbbrs[newDate.getMonth()] + " " + newDate.getFullYear();
                rangeStart = newDate.clone().firstDateOfMonth(); 
                rangeEnd = newDate.clone().lastDateOfMonth(); 
            }
            if(newView == viewMode) {
                fromd = newDate>currentDate ? 0:1;
            } else {
                fromd = 1-newView+2;
            }
            swapview(newc, fromd);
            $title.text(title);
            $prevbutton.attr("disabled", firstDate>=rangeStart);
            $nextbutton.attr("disabled", lastDate<=rangeEnd);
            currentDate = newDate.clearTime();
            viewMode = newView;
            $.cookie(getcookieid(), serializestate());
        }

        function switchViewMode() {
            setCurrentDate(currentDate, 1-viewMode);
        }
        function toggleList() {
            if($this.children().first().hasClass("calendarlist-cal")) {
                $cal.detach();
                $this.append($origlist);
            } else {
                $origlist.detach();
                $this.append($cal);
                $body.scrollLeft(boxwidth).scrollTop(boxheight);
            }
            return false;
        }

        //initilaize display
        $this.prepend($("<a>").click(toggleList).text("[view list as calendar]"));
        $this.append($("<a>").click(toggleList).text("[view list as calendar]"));
        var $origlist = $this.children().detach();
        $this.append($cal);
        var boxwidth = $box.outerWidth(), 
            boxheight = $box.outerHeight();
        $body.scrollLeft(boxwidth).scrollTop(boxheight);
        setCurrentDate(currentDate);
    })}
})( jQuery );

