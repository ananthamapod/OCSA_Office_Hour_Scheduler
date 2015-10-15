function massageHours(element) {
	function AMorPM(hour) {
		switch(hour) {
			case "9": return "AM";
			case "10": return "AM";
			case "11": return "AM";
			case "12": return "PM";
			case "1": return "PM";
			case "2": return "PM";
			case "3": return "PM";
			case "4": return "PM";
			case "5": return "PM";
			case "6": return "PM";
			case "7": return "PM";
		}
	}
	var hour = element.substring(1);
    element = element + ":00 " + AMorPM(hour);
    return element;
}