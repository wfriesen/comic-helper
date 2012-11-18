// Saves options to localStorage.
function save_options() {
	$("input[name='boxes']").each(function() {
		var id = $(this).attr("id");
		localStorage[id] = this.checked;
	});

	$("#saveMessage").show().delay(800).fadeOut(300);
}

// Select/Unselect all options
function toggle_all(source) {
	var checked = $("#toggle").attr("checked");
	$("input[name='boxes']").each(function() {
		this.checked = checked;
	});
}

$(document).ready(function() {
	// Restores select box state to saved value from localStorage.
	$("input[name='boxes']").each(function() {
		var id = $(this).attr("id");
		var checked = localStorage[id];
		this.checked = (!checked || checked == "true") ? true : false;
	});

	// If all options are checked, then check the "Select/Unselect all" checkbox
	if ($("input[name='boxes']:checked").length == $("input[name='boxes']").length) {
		$("#toggle").attr("checked", true);
	}

	$("#save").click(save_options);
	$("#toggle").click(toggle_all);
});
