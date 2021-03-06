/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', "sap/m/semantic/SemanticPage", "sap/m/semantic/SemanticType", "sap/m/semantic/SemanticPageRenderer", "sap/m/semantic/SemanticPageSegmentedContainer", "sap/m/semantic/ShareMenu", "sap/m/ActionSheet", "sap/m/OverflowToolbarLayoutData", "sap/m/Button"], function(jQuery, SemanticPage, SemanticType, SemanticPageRenderer, SegmentedContainer, ShareMenu, ActionSheet, OverflowToolbarLayoutData, Button) {
	"use strict";

	/**
	 * Constructor for a new ShareMenuPage
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A ShareMenuPage is a {@link sap.m.semantic.SemanticPage} with support for "share" menu in the footer.
	 *
	 * @extends sap.m.semantic.SemanticPage
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.m.semantic.ShareMenuPage
	 */

	var ShareMenuPage = SemanticPage.extend("sap.m.semantic.ShareMenuPage", /** @lends sap.m.semantic.ShareMenuPage.prototype */ {
		metadata: {

			aggregations: {

				/**
				 * Custom share menu buttons
				 */
				customShareMenuContent: {
					type: "sap.m.Button",
					multiple: true,
					singularName: "customShareMenuContent"
				},

				/**
				 * Wrapped instance of {@link sap.m.ActionSheet}
				 */
				_actionSheet: {
					type: "sap.m.ActionSheet",
					multiple: false,
					visibility: "hidden"
				}

			}
		},
		renderer: SemanticPageRenderer.render
	});

	ShareMenuPage.prototype._PositionInPage = jQuery.extend({ shareMenu: "shareMenu" }, SemanticPage.prototype._PositionInPage);

	ShareMenuPage.prototype._getSemanticPositionsMap = function (oControl, oConfig) {

		if (!this._oPositionsMap) {
			this._oPositionsMap = SemanticPage.prototype._getSemanticPositionsMap.apply(this, arguments);
			this._oPositionsMap[ShareMenuPage.prototype._PositionInPage.shareMenu] = {
				oContainer: this._getSegmentedShareMenu().getSectionComposite("semantic"),
				sAggregation: "content"
			};
		}

		return this._oPositionsMap;
	};

	ShareMenuPage.prototype.exit = function () {

		SemanticPage.prototype.exit.apply(this, arguments);

		if (this._oSegmentedShareMenu) {
			this._oSegmentedShareMenu.destroy();
			this._oSegmentedShareMenu = null;
		}
	};

	/*

	 SHARE MENU (CUSTOM CONTENT)
	 */

	ShareMenuPage.prototype.getCustomShareMenuContent = function () {
		return this._getSegmentedShareMenu().getSectionComposite("custom").getContent();
	};

	ShareMenuPage.prototype.addCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		this._getSegmentedShareMenu().getSectionComposite("custom").addContent(oButton, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.indexOfCustomShareMenuContent = function (oButton) {
		return this._getSegmentedShareMenu().getSectionComposite("custom").indexOfContent(oButton);
	};

	ShareMenuPage.prototype.insertCustomShareMenuContent = function (oButton, iIndex, bSuppressInvalidate) {
		this._getSegmentedShareMenu().getSectionComposite("custom").insertContent(oButton, iIndex, bSuppressInvalidate);
		return this;
	};

	ShareMenuPage.prototype.removeCustomShareMenuContent = function (oButton, bSuppressInvalidate) {
		return this._getSegmentedShareMenu().getSectionComposite("custom").removeContent(oButton, bSuppressInvalidate);
	};

	ShareMenuPage.prototype.removeAllCustomShareMenuContent = function (bSuppressInvalidate) {
		return this._getSegmentedShareMenu().getSectionComposite("custom").removeAllContent(bSuppressInvalidate);
	};

	ShareMenuPage.prototype.destroyCustomShareMenuContent = function (bSuppressInvalidate) {

		var aChildren = this.getCustomShareMenuContent();

		if (!aChildren) {
			return this;
		}

		// set suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate++;
		}

		this._getSegmentedShareMenu().getSectionComposite("custom").destroy();

		if (!this.isInvalidateSuppressed()) {
			this.invalidate();
		}

		// reset suppress invalidate flag
		if (bSuppressInvalidate) {
			this.iSuppressInvalidate--;
		}

		return this;
	};

	/**
	 * Create the internal action sheet of the "share" menu
	 * @returns {sap.m.IBar}
	 * @private
	 */
	ShareMenuPage.prototype._getActionSheet = function () {

		var oActionSheet = this.getAggregation("_actionSheet");
		if (!oActionSheet) {
			this.setAggregation("_actionSheet", new ActionSheet(
					{placement: sap.m.PlacementType.Top}));
			oActionSheet = this.getAggregation("_actionSheet");
		}

		return oActionSheet;
	};

	ShareMenuPage.prototype._getSegmentedShareMenu = function() {
		if (!this._oSegmentedShareMenu) {

			var oShareMenu = new ShareMenu(this._getActionSheet());
			var oShareMenuBtn = oShareMenu.getBaseButton();

			if (oShareMenu && oShareMenuBtn) {
				this._oSegmentedShareMenu = new SegmentedContainer(oShareMenu);
				this._oSegmentedShareMenu.addSection({sTag: "custom"});
				this._oSegmentedShareMenu.addSection({sTag: "semantic"});

				this._getSegmentedFooter().addSection({
					sTag: "shareMenu",
					aContent: [oShareMenuBtn]
				});
			}
		}
		return this._oSegmentedShareMenu;
	};

	return ShareMenuPage;
}, /* bExport= */ false);
