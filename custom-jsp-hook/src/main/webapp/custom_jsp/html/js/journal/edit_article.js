var fieldWrapperSelector = '.control-group.field-wrapper';
var fieldsDisplaySelector = '#_15__fieldsDisplay';

initSort();

/**
 * Initialize sorting functionality.
 *
 */
function initSort() {
	YUI().use('node', 'transition', function (Y) {
		// Capture clicks on up/down button
		Y.one('.lfr-ddm-container').delegate('click', moveDown, '.lfr-ddm-reorder-down-button');
		Y.one('.lfr-ddm-container').delegate('click', moveUp, '.lfr-ddm-reorder-up-button');

		// Capture clicks on anything where we need to redraw the arrows.
		Y.one('.lfr-ddm-container').delegate('click', updateArrowsAndButtons, '.lfr-ddm-repeatable-add-button');
		Y.one('.lfr-ddm-container').delegate('click', updateArrowsAndButtons, '.lfr-ddm-repeatable-delete-button');
	});
	updateArrowsAndButtons();
}

/**
 * Main function for painting/repainting arrows and delete buttons
 *  
 * When a) initialized, b) a new repeatable field is added/removed, c) a field is moved up/down
 * first remove all reorder arrows and delete buttons. Then re-paint them again to all the places
 * they should be.
 *
 */
function updateArrowsAndButtons() {
	setTimeout(function() { // Timeout needed to allow the other Liferay javascript to finish repainting the DOM.
		YUI().use('node', function (Y) {
			var allFieldWrappers = Y.all(fieldWrapperSelector);
			removeDeleteButtons();
			removeReorderArrows();
			allFieldWrappers.each(function (elFieldWrapper) {
				var siblings = hasSiblings(elFieldWrapper);
				if (siblings) {
					addReorderArrows(elFieldWrapper, siblings);
					addDeleteButtons(elFieldWrapper, siblings);
				}
			});
			setReorderArrowsStyle();
		});
	}, 100);
}

/**
 * Updates the hidden input field which Liferay uses for sort order of the fields
 *
 */
function updateFieldsDisplay() {
	YUI().use('node', function (Y) {
		var allFieldWrappers = Y.all(fieldWrapperSelector);
		var fieldsDisplay = [];
		allFieldWrappers.each(function (elFieldWrapper) {
			fieldsDisplay.push(elFieldWrapper.getData('fieldname') + elFieldWrapper.getData('fieldnamespace'));
		});
		var input = Y.one(fieldsDisplaySelector);
		input.set('value', fieldsDisplay.join(','));
	});
}


/**
 * Move a wrapper (field) up or down.
 *
 * When a field is moved, then update the reordering arrows, the hidden input field which
 * holds the order data and add a color animation to mark it as "just moved".
 *
 */
function moveDown() {
	moveWrapper(this.ancestor(fieldWrapperSelector), 'down');
}

function moveUp() {
	moveWrapper(this.ancestor(fieldWrapperSelector), 'up');
}

function moveWrapper(clickedWrapper, direction) {
	var nextWrapper;
	if (direction === 'up') {
		nextWrapper = clickedWrapper.previous(fieldWrapperSelector);
	} else {
		nextWrapper = clickedWrapper.next(fieldWrapperSelector);
	}

	clickedWrapper.swap(nextWrapper);
	colorMarkMoved(clickedWrapper);
	updateFieldsDisplay();
	updateArrowsAndButtons();
}

/**
 * Quick background color animation to tell the user "this just moved".
 *
 */
function colorMarkMoved(el) {
	el.transition({
		duration: 0.3,
		backgroundColor: "rgba(250, 255, 175, 1)",
	}, function () {
		el.transition({
			delay: 0,
			duration: 1,
			backgroundColor: "rgba(250, 255, 175, 0)",
		});
	});
}

/**
 * Check if element has siblings of the same type (e.g. if a repatable field has been repeated).
 *
 */
function hasSiblings (el) {
	var curSelector = fieldWrapperSelector + '[data-fieldname="' + el.getData('fieldname') + '"]';
	if (el.next(curSelector) !== null && el.previous(curSelector) !== null) {
		return 'both';
	} else if (el.next(curSelector) !== null) {
		return 'after';
	} else if (el.previous(curSelector) !== null) {
		return 'before';
	} else {
		return false;
	}
}

/**
 * Add Reorder buttons depending on if the element has siblings or not.
 *
 * If the fields is the first field - just add down button
 * If the field is the last field - just add up button
 * If the field has siblings on both sides - add both up and down button
 *
 */
function addReorderArrows(el, siblings) {
	if (siblings === 'before' || siblings === 'both') {
		el.append('<a class="lfr-ddm-reorder-up-button lfr-ddm-reorder-button icon-arrow-up" href="javascript:;"></a>');
	}

	if (siblings === 'after' || siblings === 'both') {
		el.append('<a class="lfr-ddm-reorder-down-button lfr-ddm-reorder-button icon-arrow-down" href="javascript:;"></a>');
	}
}

/**
 * Add Delete buttons depending on if the element has siblings or not.
 *
 * If the field is the first field (and therefor don't have a sibling above) - don't add a delete button. 
 * This mimics the way Liferay do it; In vanilla Liferay, you can't delete the _first_ element in a list 
 * of repeatable fields. Else, add a delete button.
 *
 */
function addDeleteButtons(el, siblings) {
	if (siblings === 'before' || siblings === 'both') {
		el.append('<a class="lfr-ddm-repeatable-delete-button icon-minus-sign" href="javascript:;"></a>');
	}
}

/**
 * Remove all Delete and Reorder buttons (before adding them again)
 *
 */
function removeDeleteButtons() {
	YUI().use('node', function (Y) {
		var allButtons = Y.all('.lfr-ddm-repeatable-delete-button');
		allButtons.remove();
	});
}

function removeReorderArrows() {
	YUI().use('node', function (Y) {
		var allButtons = Y.all('.lfr-ddm-reorder-button');
		allButtons.remove();
	});
}

/**
 * Add styling by injecting inline css. This could also be done by updating the theme,
 * but doing it this way means that we don't have to do any changes to the out-of-the-box
 * control panel theme.
 *
 */
function setReorderArrowsStyle() {
	YUI().use('node', function (Y) {
		var allButtons = Y.all('.lfr-ddm-reorder-button');
		allButtons.setStyle('display', 'block');
		allButtons.setStyle('height', '16px');
		allButtons.setStyle('position', 'absolute');
		allButtons.setStyle('top', '4px');
		allButtons.setStyle('width', '16px');

		var upButtons = Y.all('.lfr-ddm-reorder-up-button');
		upButtons.setStyle('right', '44px');

		var downButtons = Y.all('.lfr-ddm-reorder-down-button');
		downButtons.setStyle('right', '64px');
	});
}