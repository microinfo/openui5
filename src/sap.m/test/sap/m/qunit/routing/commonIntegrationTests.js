sap.ui.define(
	[
		"sap/m/NavContainer",
		"sap/m/SplitContainer"
	],
	function (NavContainer, SplitContainer) {
		"use strict";

		function createViewAndController(sName) {
			sap.ui.controller(sName, {});
			sap.ui.jsview(sName, {
				createContent: function () {
				},
				getController: function () {
					return sap.ui.controller(sName);
				}
			});

			return sap.ui.jsview(sName);
		}

		return {
			start : function (oOptions) {

				var fnSetup = oOptions.setup;
				var fnAct = oOptions.act;

				///////////////////////////////////////////////////////
				/// Integation test
				///////////////////////////////////////////////////////
				QUnit.module("Common integration tests", {
					teardown: function () {
						oOptions.teardown.call(this);
					}
				});

				QUnit.test("Should add one Navigation per detail and master aggregation for split app in desktop", function () {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oSplitContainerSpy = this.spy(oSplitContainer, "to"),
						oRouter = fnSetup.call(this, {
							"dummyMaster": {
								targetControl: oSplitContainer.getId(),
								view: "MasterDummy",
								viewType: "JS",
								targetAggregation: "masterPages",
								subroutes: {
									"dummyDetail": {
										targetAggregation: "detailPages",
										view: "DetailDummy",
										viewType: "JS",
										subroutes: {
											"master": {
												targetAggregation: "masterPages",
												view: "Master",
												viewType: "JS",
												subroutes: {
													"detail": {
														pattern: "detail",
														view: "Detail",
														viewType: "JS",
														targetAggregation: "detailPages"
													}
												}
											}
										}
									}
								}
							}
						});

					this.stub(sap.ui.Device.system, "phone", false);

					//views
					createViewAndController("Detail");
					createViewAndController("DetailDummy");
					createViewAndController("Master");
					createViewAndController("MasterDummy");

					//Act
					fnAct.call(this, "detail");

					//Assert
					strictEqual(oSplitContainerSpy.callCount, 2, "did invoke add two navigations");

					var oCurrentDetail = oSplitContainer.getCurrentDetailPage();
					var oCurrentMaster = oSplitContainer.getCurrentMasterPage();
					strictEqual(oCurrentDetail.getViewName(), "Detail", "did navigate to the detail view");
					strictEqual(oCurrentMaster.getViewName(), "Master", "did navigate to the master view");

					var oFirstCall = oSplitContainerSpy.getCall(0);
					var oSecondCall = oSplitContainerSpy.getCall(1);

					strictEqual(oFirstCall.args[0], oCurrentMaster.getId(), "did invoke it with the master view");
					strictEqual(oSecondCall.args[0], oCurrentDetail.getId(), "did invoke it with the detail view");
				});

				QUnit.test("Should preserve the view that is currently in the master or detail if configured (splitapp desktop)", function () {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oRouter =  fnSetup.call(this, {
							"firstMaster": {
								targetControl: oSplitContainer.getId(),
								view: "FirstMaster",
								viewType: "JS",
								targetAggregation: "masterPages",
								preservePageInSplitContainer: true,
								subroutes: {
									"detail": {
										pattern: "detail",
										targetAggregation: "detailPages",
										view: "Detail",
										viewType: "JS"
									}
								}
							},
							"secondMaster": {
								targetControl: oSplitContainer.getId(),
								pattern: "secondMaster",
								view: "SecondMaster",
								viewType: "JS",
								targetAggregation: "masterPages"
							}
						});

					this.stub(sap.ui.Device.system, "phone", false);

					//views
					createViewAndController("Detail");
					createViewAndController("FirstMaster");
					createViewAndController("SecondMaster");

					//Act
					fnAct.call(this, "secondMaster");
					assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");
					fnAct.call(this, "detail");

					//Assert
					assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
					assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
				});

				QUnit.test("Should not preserve the view that is currently in the master or detail if it is matching the pattern", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oRouter =  fnSetup.call(this, {
							"firstMaster": {
								targetControl: oSplitContainer.getId(),
								pattern: "firstMaster",
								view: "FirstMaster",
								viewType: "JS",
								targetAggregation: "masterPages",
								preservePageInSplitContainer: true
							},
							"secondMaster": {
								targetControl: oSplitContainer.getId(),
								pattern: "secondMaster",
								view: "SecondMaster",
								viewType: "JS",
								targetAggregation: "masterPages"
							}
						});

					//views
					createViewAndController("FirstMaster");
					createViewAndController("SecondMaster");

					//Act
					fnAct.call(this, "secondMaster");
					assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did load the secondMaster");
					fnAct.call(this, "firstMaster");

					//Assert
					assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "FirstMaster", "did switch the masterview");
				});

				QUnit.test("Should preserve the view that is currently in the master with multiple Masters", function (assert) {
					//Arrange
					var oSplitContainer = new SplitContainer(),
						oRouter =  fnSetup.call(this, {
								"firstMaster": {
									targetControl: oSplitContainer.getId(),
									view: "FirstMaster",
									targetAggregation: "masterPages",
									viewType: "JS",
									subroutes: {
										"secondMaster": {
											view: "SecondMaster",
											targetAggregation: "masterPages",
											viewType: "JS",
											subroutes: {
												"thirdMaster": {
													view: "ThirdMaster",
													targetAggregation: "masterPages",
													preservePageInSplitContainer: true,
													viewType: "JS",
													subroutes: {
														"detail": {
															pattern: "detail",
															targetAggregation: "detailPages",
															view: "Detail",
															viewType: "JS"
														}
													}
												}
											}
										}
									}
								}
							});

					this.stub(sap.ui.Device.system, "phone", false);

					//views
					createViewAndController("Detail");
					createViewAndController("FirstMaster");
					createViewAndController("SecondMaster");
					createViewAndController("ThirdMaster");


					//Act
					assert.strictEqual(oSplitContainer.getCurrentMasterPage(), undefined, "did not load a master yet");
					fnAct.call(this, "detail");

					//Assert
					assert.strictEqual(oSplitContainer.getCurrentDetailPage().getViewName(), "Detail", "did navigate to the detail view");
					assert.strictEqual(oSplitContainer.getCurrentMasterPage().getViewName(), "SecondMaster", "did not switch the masterview");
				});

			}
		};

		}
	,true);