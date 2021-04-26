//This is the code which will be injected into a given page...

(function() {
	
	//Create Global Namespace
	if (typeof horizenRewardExporter === 'undefined') {
		
		horizenRewardExporter = {
			
			address : '',
			rewardAddresses : 'zsi4CcCUYtR1iNjEyjkLPjSVPzSPa4atxt9' + '\n' + 'zsoVG9Evw68te8hRAP3xPXSbx9HoH26LUYN',
			images : ['' + chrome.runtime.getURL('images/ui-icons_444444_256x240.png'), '' + chrome.runtime.getURL('images/ui-icons_555555_256x240.png'), '' + chrome.runtime.getURL('images/loader.gif')],
			
			status : '',
			
			log : function(content, type, timeFlag) {
				
				var style = '';
				
				//Green
				if (type == 1) {
					
					style = 'green';
					
				//Orange	
				} else if (type == 2) {
				
					style = 'orange';
				
				//Red
				} else if (type == 3) {
					
					style = 'red';
					
				//Neutral	
				} else {
					
					style = 'black';
					
				}
				
				var d = new Date();
				//d.toLocaleString();       // -> "2/1/2013 7:37:08 AM"
				//d.toLocaleDateString();   // -> "2/1/2013"
				//d.toLocaleTimeString();  // -> "7:38:05 AM"
				
				var currentDateTime = '';
				
				if (timeFlag === false) { currentDateTime = ''; } else { currentDateTime = '[' + d.toLocaleTimeString() + ']'; }
				
				$('#HTC-Output').append('<div style="font-size: 90%; margin-top: 25px; color:' + style + '">' + currentDateTime + '&nbsp;&nbsp;' + content + '</div>').animate({ scrollTop: $('#HTC-Output')[0].scrollHeight }, "slow");
				
				
			},
			
			formatDate : function(timeStamp, notFormatted) {
				
				if (notFormatted === true) {
					
					return new Date(timeStamp * 1000);
					
				} else {
					
					return new Date(timeStamp * 1000).toLocaleDateString('de-DE', 	{ // you can skip the first argument
																					year: "numeric",
																					month: "2-digit",
																					day: "2-digit",
																				});
																				
				}
				
			},
			
			transactions : {
				
				receivedTotal : 0,
				
				pagesTotal : 0,
				currentPage : 0,
				
				exclude : 5,
				
				info : [],
				infoFiltered : [],
				raw : [],
				
				cache : 0, 
				
				get : function() {
					
					if (horizenRewardExporter.status == 'querying') {
						
						var expUrl = '';
						
						if (window.location.href.indexOf('explorer.zensystem.io') > -1) {
							
							expUrl = 'insight-api-zen';
						
						} else {
							
							expUrl = 'api';
							
						}
						
						//https://explorer.horizen.global/
						var jqxhr = $.ajax(expUrl + '/txs?address=' + horizenRewardExporter.address + '&pageNum=' + horizenRewardExporter.transactions.currentPage).done(function(result) {
							
							horizenRewardExporter.transactions.raw = horizenRewardExporter.transactions.raw.concat(result.txs);
							
							if (horizenRewardExporter.transactions.currentPage == 0) {
								
								horizenRewardExporter.log('PagesTotal: ' + result.pagesTotal + ' - starting to pull all pages.', 0);
								horizenRewardExporter.transactions.pagesTotal = result.pagesTotal - 1;
								
							}
								
							var txsContent = '';
							
							var rewardAddresses = $('#rewardAddresses').val().split(/\r?\n/g);
							
							result.txs.forEach(function (elementTa, index) {
								
								txsContent += '<br> - <b>txid:</b> ' + elementTa.txid;
								
								var isReward = false;
								
								//Look for mining or node rewards
								elementTa.vin.forEach(function (elementTaData, index) {
									
									rewardAddresses.forEach(function (address, index) {
										
										if (elementTaData.addr == $.trim(address)) {
										
											isReward = true;
											
										}
										
									});
									
								});
								
								//Look for received transactions
								elementTa.vout.forEach(function (elementTaData, index) {
									
									elementTaData.scriptPubKey.addresses.forEach(function (elementAddress, index) {
									
										if (elementAddress == horizenRewardExporter.address) {
											
											var blockDate = horizenRewardExporter.formatDate(elementTa.time);
											var zenVal = parseFloat(elementTaData.value);
											
											if (isReward) {
												
												horizenRewardExporter.transactions.info.push({
													
													txid : elementTa.txid,
													date : elementTa.time,
													received : {
															
														value : zenVal
														
													}
													
													
												});
												
												horizenRewardExporter.transactions.cache += zenVal;
											
											}
											
											txsContent += '<br> - - <b>N:</b> ' + elementTaData.n;
											txsContent += '<br> - - - Date: ' + blockDate;
											txsContent += '<br> - - - Received: ' + elementTaData.value + ' ZEN';
											
											horizenRewardExporter.transactions.receivedTotal += zenVal;
											
											
											
										}
									
									});
									
								});
								
							});
							
							horizenRewardExporter.log('<span style="cursor: pointer; padding: 2px; " id="tas_page_' + horizenRewardExporter.transactions.currentPage + '_header">CurrentPage: ' + (horizenRewardExporter.transactions.currentPage + 1) + ' &#8595;</span><br><span style="display: none;" id="tas_page_' + horizenRewardExporter.transactions.currentPage + '_content">' + txsContent + '</span>');
							
							$('#tas_page_' + horizenRewardExporter.transactions.currentPage + '_header').click(function() {
								
								$(this).next().next().toggle();
								
							}).hover(function() {
								
							  $(this).css('background-color', 'green');
							  
							}, function() {
								
							  $(this).css('background-color', 'white');
							  
							});
							
							$('#pagesGui').html('Page: ' + (horizenRewardExporter.transactions.currentPage + 1) + '/' + (horizenRewardExporter.transactions.pagesTotal + 1));
							
							if (horizenRewardExporter.transactions.pagesTotal > horizenRewardExporter.transactions.currentPage) {
								
								horizenRewardExporter.transactions.currentPage++;
							
								setTimeout(function() {
									
									horizenRewardExporter.transactions.get();
									
								}, 1000);
							
							} else {
								
								//console.log('Cache:');
								//console.log(horizenRewardExporter.transactions.cache);
								
								console.log('Raw:');
								console.log(JSON.parse(JSON.stringify(horizenRewardExporter.transactions.raw)));
								
								for (var indexTa = 0; indexTa < horizenRewardExporter.transactions.raw.length; indexTa++) {
									
									for (var indexTaVin = 0; indexTaVin < horizenRewardExporter.transactions.raw[indexTa].vin.length; indexTaVin++) {
										
										if (horizenRewardExporter.transactions.raw[indexTa].vin[indexTaVin].addr != horizenRewardExporter.address) {
											
											horizenRewardExporter.transactions.raw[indexTa].vin.splice(indexTaVin, 1);
											//console.log('vin removed at ' + indexTa + ' ' + indexTaVin);
											indexTaVin--; 
											
											
										}
										
									}
									
									for (var indexTaVout = 0; indexTaVout < horizenRewardExporter.transactions.raw[indexTa].vout.length; indexTaVout++) {
										
										var addressFound = false;
										
										for (var indexTaVoutAddresses = 0; indexTaVoutAddresses < horizenRewardExporter.transactions.raw[indexTa].vout[indexTaVout].scriptPubKey.addresses.length; indexTaVoutAddresses++) {
											
											if (horizenRewardExporter.transactions.raw[indexTa].vout[indexTaVout].scriptPubKey.addresses[indexTaVoutAddresses] != horizenRewardExporter.address) {
											
												addressFound = true;
											
											}
											
										}
										
										if (addressFound) {
											
											horizenRewardExporter.transactions.raw[indexTa].vout.splice(indexTaVout, 1);
											//console.log('vout removed at ' + indexTa + ' ' + indexTaVout);
											indexTaVout--; 
											
										}
										
									}
									
								}
								
								console.log('Raw filtered by Address:');
								console.log(horizenRewardExporter.transactions.raw);
								
								horizenRewardExporter.status = '';
								
								//Set min max date
								horizenRewardExporter.transactions.filter.startDate = horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[horizenRewardExporter.transactions.info.length - 1].date);
								horizenRewardExporter.transactions.filter.endDate = horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[0].date);
								
								$('#startDate').datepicker({
						
									dateFormat: 'dd.mm.yy',
									minDate: horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[horizenRewardExporter.transactions.info.length - 1].date, true),
									maxDate: horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[0].date, true)
									
								});
								
								$('#endDate').datepicker({
						
									dateFormat: 'dd.mm.yy',
									minDate: horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[horizenRewardExporter.transactions.info.length - 1].date, true),
									maxDate: horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[0].date, true)
									
								});
								
								$("<style type='text/css'>.ui-widget-header .ui-icon { background-image: url('" + horizenRewardExporter.images[0] + "') } .ui-state-hover .ui-icon { background-image: url('" + horizenRewardExporter.images[1] + "') !important } </style>").appendTo("head");
								
								//console.log(chrome.runtime.getURL('images/ui-icons_555555_256x240.png'));
								
								$('#startDate').val(horizenRewardExporter.transactions.filter.startDate);
								$('#endDate').val(horizenRewardExporter.transactions.filter.endDate);
								
								horizenRewardExporter.log(`Done. <br>Pages ` + (horizenRewardExporter.transactions.currentPage + 1) + `/` + (horizenRewardExporter.transactions.pagesTotal + 1) + ` received.<br>
								From ` + horizenRewardExporter.transactions.filter.startDate + ` to ` + horizenRewardExporter.transactions.filter.endDate + `. 
								<br>` + horizenRewardExporter.transactions.raw.length + ` transactions processed.<br>` + horizenRewardExporter.transactions.receivedTotal + ` Zen received.`, 1);
								
								console.log('Rewards:');
								console.log(horizenRewardExporter.transactions.info);
								
								$('#filterCointainer').removeClass('hidden');
								$('#loaderImg').fadeOut();
								
							}
							
						}).fail(function() {
							
							horizenRewardExporter.log('Error when querying the transactions...retrying...', 3);
							
							setTimeout(function() {
								
								horizenRewardExporter.transactions.get();
								
							}, 1000);
							
						});
						
					}
				
				},
				
				filter : {
					
					startDate : {},
					endDate : {},
					coinAmount : 0,
					
					apply : function() {
						
						horizenRewardExporter.transactions.infoFiltered = jQuery.extend(true, [], horizenRewardExporter.transactions.info);
						//console.log(horizenRewardExporter.transactions.infoFiltered);
						
						var logContent = '';
						
						var dataFilteredTemp = [];
						
						//obigen reward filter hier hin bauen mit input von addressen
						
							
						var newStartDate = $.datepicker.parseDate('dd.mm.yy', $('#startDate').val());
						var newEndDate = $.datepicker.parseDate('dd.mm.yy', $('#endDate').val());
						
						//Use complete EndDate
						newEndDate.setHours(23);
						newEndDate.setMinutes(59);
						newEndDate.setSeconds(59);
						
						for (var elementTa in horizenRewardExporter.transactions.infoFiltered) {
							
							//console.log('---------------');
							//console.log('newStartDate: ' + newStartDate);
							//console.log('newEndDate: ' + newEndDate);
							//console.log('blockDate: ' + horizenRewardExporter.formatDate(horizenRewardExporter.transactions.info[elementTa].date, true));
							
							if (newStartDate <= horizenRewardExporter.formatDate(horizenRewardExporter.transactions.infoFiltered[elementTa].date, true) 
								&& newEndDate >= horizenRewardExporter.formatDate(horizenRewardExporter.transactions.infoFiltered[elementTa].date, true)) {
								
								dataFilteredTemp.push(jQuery.extend(true, {}, horizenRewardExporter.transactions.infoFiltered[elementTa]));
								
							}
						  
						}
						
						horizenRewardExporter.transactions.infoFiltered = dataFilteredTemp;
						dataFilteredTemp = [];
						
						logContent += '<br> - Time range';
						
						if ($("#summarizeTas").val() == 'monthly') {
							
							var transactionNumber = 0;
							
							var currentMonth = false;
							var lastMonth = false;
							
							var currentReceivedZen = 0;
							var dataLength = horizenRewardExporter.transactions.infoFiltered.length - 1;
							
							var lastElement = false;
							
							for (var elementTa in horizenRewardExporter.transactions.infoFiltered) {
								
								currentMonth = horizenRewardExporter.formatDate(horizenRewardExporter.transactions.infoFiltered[elementTa].date, true);
								
								if (lastMonth === false) lastMonth = currentMonth;
								
								if (elementTa == dataLength) {
									
									lastElement = true;
									currentReceivedZen += parseFloat(horizenRewardExporter.transactions.infoFiltered[elementTa].received.value);
									
								}
								
								//Close last month and create transaction
								if (currentMonth.getMonth() != lastMonth.getMonth() || currentMonth.getYear() != lastMonth.getYear() || lastElement === true) {
									
									lastMonth.setDate(1);
									lastMonth.setHours(0, 0, 0, 0);

									dataFilteredTemp.push(jQuery.extend(true, {}, {
										
										txid : transactionNumber,
										date : lastMonth.getTime() / 1000,
										received : {
											
											value : currentReceivedZen
												
										}
											
									}));
									
									transactionNumber++;
									
									currentReceivedZen = 0;
									
									//console.log(new Date(lastMonth));
									
									lastMonth = currentMonth;
									
								} 
									
								currentReceivedZen += parseFloat(horizenRewardExporter.transactions.infoFiltered[elementTa].received.value);

							}
							
							horizenRewardExporter.transactions.infoFiltered = dataFilteredTemp;
							dataFilteredTemp = [];
							
							logContent += '<br> - Monthly summarized';
						
						}
						
						if ($("#summarizeTas").val() == 'yearly') {
							
							var transactionNumber = 0;
							
							var currentYear = false;
							var lastYear = false;
							
							var currentReceivedZen = 0;
							var dataLength = horizenRewardExporter.transactions.infoFiltered.length - 1;
							
							var lastElement = false;
							
							for (var elementTa in horizenRewardExporter.transactions.infoFiltered) {
								
								currentYear = horizenRewardExporter.formatDate(horizenRewardExporter.transactions.infoFiltered[elementTa].date, true);
								
								if (lastYear === false) lastYear = currentYear;
								
								if (elementTa == dataLength) {
									
									lastElement = true;
									currentReceivedZen += parseFloat(horizenRewardExporter.transactions.infoFiltered[elementTa].received.value);
									
								}
								
								//Close last year and create transaction
								if (currentYear.getYear() != lastYear.getYear() || lastElement === true) {
									
									lastYear.setDate(1);
									lastYear.setMonth(0);
									lastYear.setHours(0, 0, 0, 0);
									
									dataFilteredTemp.push(jQuery.extend(true, {}, {
										
										txid : transactionNumber,
										date : lastYear.getTime() / 1000,
										received : {
											
											value : currentReceivedZen
												
										}
											
									}));
									
									transactionNumber++;
									
									currentReceivedZen = 0;
									
									//console.log(new Date(lastYear));
									
									lastYear = currentYear;
									
								} 
									
								currentReceivedZen += parseFloat(horizenRewardExporter.transactions.infoFiltered[elementTa].received.value);

							}
							
							horizenRewardExporter.transactions.infoFiltered = dataFilteredTemp;
							dataFilteredTemp = [];
							
							logContent += '<br> - Yearly summarized';
						
						}
						
						logContent += '<br> - ' + $('#dataType').val();
						logContent += '<br> - ' + $('#fileFormat option:selected').text();
						
						var receivedTotal = 0;
						
						for (var elementTa in horizenRewardExporter.transactions.infoFiltered) {
							
							receivedTotal += horizenRewardExporter.transactions.infoFiltered[elementTa].received.value;
						  
						}
						
						logContent += '<br><br>Zen: ' + receivedTotal;
						logContent += '<br> - Received: ' + receivedTotal;
						
						horizenRewardExporter.log('Applied filters: <br>' + logContent);
						
						console.log('Rewards filtered:');
						console.log(horizenRewardExporter.transactions.infoFiltered);
						
					}
					
				},
				
				exportRewards : function() {
					
					//Generate Export
					var csvContent = "data:text/csv;charset=utf-8,";
					var csvRow = '';
					var rowArray = [];
					var rewardType = $('#dataType').val();
					var fileFormat = $('#fileFormat').val();
											
					horizenRewardExporter.transactions.infoFiltered.forEach(function(element, index) {
						
						switch (fileFormat) {
							
							case 'none':
							
								rowArray.push(rewardType);
								rowArray.push(element.received.value);
								rowArray.push('ZEN');
								rowArray.push(new Date(element.date * 1000).toISOString());
								
								if ($("#summarizeTas").val() == 'none') {
									
									rowArray.push(element.txid);
									
								}
								
								if (index == 0) {
									
									csvRow += "\"type\",\"value\",\"currency\",\"date\",\"txid\"\r\n";
									
								}
							
							break;
							
							case 'cointracking':
							
								rowArray.push(rewardType);
								rowArray.push(element.received.value);
								rowArray.push('ZEN');
								rowArray.push('');
								rowArray.push('');
								rowArray.push('');
								rowArray.push('');
								rowArray.push('');
								rowArray.push('');
								rowArray.push('');
								rowArray.push(new Date(element.date * 1000).toISOString());
								
								if ($("#summarizeTas").val() == 'none') {
									
									rowArray.push(element.txid);
									
								}
								
								//console.log(new Date(element.date * 1000).toLocaleString());
								
								if (index == 0) {
									
									csvRow += "\r\n";
									
									//csvRow += "\"Type\", \"Buy Amount\", \"Buy Currency\", \"Sell Amount\", \"Sell Currency\", \"Fee\", \"Fee Currency\", \"Exchange\", \"Trade-Group\", \"Comment\", \"Date\", \"Tx-ID\"\r\n";
									
								}
							
							break;
							
						}
						
						csvRow += rowArray.join(",");
						csvContent += csvRow + "\r\n";
						
						csvRow = '';
						rowArray = [];
						
					});
					
					var encodedUri = encodeURI(csvContent);
					var link = document.createElement("a");
					link.setAttribute('href', encodedUri);
					link.setAttribute('download', horizenRewardExporter.address + '_rewards.csv');
					document.body.appendChild(link); 

					link.click();
					
				},
				
				exportRawTas : function() {
					
					//Generate Export
					var csvContent = "data:text/csv;charset=utf-8,";
											
					horizenRewardExporter.transactions.raw.forEach(function(element, index) {
						
						csvContent += JSON.stringify(horizenRewardExporter.transactions.raw[index]) + "\r\n";
						
					});
					
					var encodedUri = encodeURI(csvContent);
					var link = document.createElement("a");
					link.setAttribute('href', encodedUri);
					link.setAttribute('download', horizenRewardExporter.address + '_raw_transactions.txt');
					document.body.appendChild(link); 

					link.click();
					
				}
				
			},
			
			//Create GUI
			gui : {
				
				waitForEl : function(selector, callback) {
					
					if (jQuery(selector).length) {
					  
						callback(selector);
						
				  } else {
					  
					setTimeout(function() {
						
						horizenRewardExporter.gui.waitForEl(selector, callback);
						
					}, 100);
					
				  }
				  
				},
				
				getContentDashboard : function() {
					
					var content = '<br>';
					
					content = 	`
								<div id="closeHrteGui" style="position: absolute; font-size: 200%; right: 20px; top: 10px; cursor: pointer;">X</div>
								<h2>Horizen Rewards/Transactions Export</h2>
								Address: <span id="HrteAddressField"></span><br>
								<div style="display: inline-block; padding: 2%; width: 50%; overflow: auto;  max-height: 75%" id="HTC-Output"></div>
								<img id="loaderImg" style="display: none; position: absolute; font-size: 100%; left: 20px; bottom: 10px; width: 20px; height: auto;" src="` + horizenRewardExporter.images[2] + `" alt="Loader"><div id="pagesGui" style="position: absolute; font-size: 100%; left: 45px; bottom: 10px;"></div>
								<div style="display: inline-block; padding: 2%; width: 49%; border-left: 2px solid black; vertical-align: top;" id="HTC-Options"><h3 style="margin-top: 0;">Controls</h3>
									<div style="display: inline-block; width: 40%;">Reward addresses:<br><textarea id="rewardAddresses" rows="3" style="resize: none; font-size: 75%; width: 100%;">` + horizenRewardExporter.rewardAddresses + `</textarea></div>
									<div style="display: inline-block; width: 15%;"><button id="Hrte_start_button" type="button">Start</button><br><button id="Hrte_reset_button" style="margin-top: 6%;" type="button">Reset</button></div>
									<div style="display: inline-block; width: 15%; border: 0px solid black;"><center><span style="font-size: 300%;">?</span><br><button id="userGuide" type="button">User guide</button></center></div>
									<div style="display: inline-block; width: 15%; border: 0px solid black;"><center><span style="font-size: 300%;">&#9993;</span><br><button id="contactDeveloper" type="button">Contact developer</button></center></div>
									<div id="filterCointainer" style="width: 100%;" class="hidden">
										<h3>Filter</h3>
										<div class="fieldsetHrte" style="width: 29%">
											<fieldset style="width: 100%;">
												<legend class="legendHrte">Time rage: </legend>
													<div style="display: inline-block; width: 35%;">
														StartDate<br>
														EndDate 
													</div>
													<div style="display: inline-block; width: 50%; margin-left: 5%;">
														<input style="width: 100%; type="text" id="startDate"><br>
														<input style="width: 100%; type="text" id="endDate">
													</div>
											</fieldset>
										</div>
										<div class="fieldsetHrte" style="margin-left: 5%;">
											<fieldset>
												<legend class="legendHrte">Summarize rewards</legend>
												<select id="summarizeTas">
													<option value="none">No summarize</option>
													<option value="monthly">Summarize Montly</option>
													<option value="yearly">Summarize Yearly</option>
												</select>
											</fieldset>
										</div>
										<div class="fieldsetHrte" style="margin-left: 5%;">
											<fieldset>
												<legend class="legendHrte">Export type and format</legend>
												<select id="dataType">
													<option value="-">No Type</option>
													<option value="Masternode">Masternode</option>
													<option value="Mining">Mining</option>
													<option value="Mining (commercial)">Mining (commercial)</option>
													<option value="Minting">Minting</option>
													<option value="Staking">Staking</option>
												</select><br>
												<select id="fileFormat">
													<option value="none">No specific format</option>
													<option value="cointracking">cointracking.info</option>
												</select>
											</fieldset>
										</div>
										<br>										
										<br>
										<br><button id="startExportRewards" type="button">Export rewards as CSV</button>&nbsp;&nbsp;&nbsp;<button id="startExportRaw" type="button">Export all transactions (raw)</button>
									</div>
								</div>`;
					
					return content;
					
				},
				
				getContentUserGuide : function() {
					
					var content = `
						<div id="closeUserGuide" style="position: absolute; font-size: 200%; right: 20px; top: 10px; cursor: pointer;">X</div>
						<h2 style="margin-top: 0;">User guide</h2>
						<span style="font-size: 150%;">Steps:</span><br>
						<ol>
						  <li>Enter your address in the top search bar of the insight explorer.</li>
						  <li>Click the "Download all rewards/transactions" button.</li>
						  <li>Have a look at the Reward addresses. 
						  The two given addresses are for the payments from master- and securenodes. 
						  They usually do not need to be changed.
						  You can add further addresses, for example those of a mining pool.
						  The rewards will later be recognized as such when they came from one of these addresses.</li>
						  <li>Click the "Start" button to fetch all transactions.</li>
						  <li>Wait for the tool to finish querying.</li>
						  <li>Select your time range.</li>
						  <li>If you want to combine your transactions into one per month or year, you can use the filter "Summarize rewards".
						  This can be useful if you would otherwise have hundreds or even thousands of transactions.</li>
						  <li>Select your export type and format.</li>
						  <li>Click the "Export rewards as CSV" button. 
						  Or, if you want to download all transactions in raw format and not only the rewards, click on the "Export all transactions (raw)" button.</li>
						</ol> 
						<br>
						Note that the dates are output in GMT/UTC. It should be correct for your time zone when imported.
					
					`;	
					
					return content;
					
				},
				
				insert : function() {
					
					//Dashboard
					$('<div id="horizenRewardExporterGui" />').
					css( { 	'z-index' : 99, 
							display: 'none',
							padding : '2%', 
							height : '70%', 
							width : '80%', 
							position : 'fixed', 
							top : '20%', 
							left : '10%', 
							backgroundColor : 'rgba(255,255,255, 0.8)',
							border: '2px solid black' } ).
					html(horizenRewardExporter.gui.getContentDashboard()).
					appendTo('#wrap');
					
					//User guide
					$('<div id="userGuideGui" />').
					css( { 	'z-index' : 100, 
							display: 'none',
							padding : '2%', 
							height : '55%', 
							width : '40%', 
							position : 'fixed', 
							top : '30%', 
							left : '30%', 
							backgroundColor : 'rgba(255,255,255, 0.9)',
							border: '2px solid black' } ).
					html(horizenRewardExporter.gui.getContentUserGuide()).
					appendTo('#wrap');
					
					$('#summarizeTas').change(function() {
						
						localStorage.setItem('summarizeTas', this.value);
						
					});
					
					if (localStorage.getItem('summarizeTas')){
						
						$('#summarizeTas').val(localStorage.getItem('summarizeTas'));
						
					}
					
					$('#dataType').change(function() {
						
						localStorage.setItem('dataType', this.value);
						
					});
					
					if (localStorage.getItem('dataType')){
						
						$('#dataType').val(localStorage.getItem('dataType'));
						
					}
					
					$('#fileFormat').change(function() {
						
						localStorage.setItem('fileFormat', this.value);
						
					});
					
					if (localStorage.getItem('fileFormat')){
						
						$('#fileFormat').val(localStorage.getItem('fileFormat'));
						
					}
					
					$('#closeHrteGui').click(function() {
						
						$(this).parent().toggle();
						
					});
					
					$('#closeUserGuide').click(function() {
						
						$(this).parent().toggle();
						
					});
					
					$('#userGuide').click(function() {
						
						$('#userGuideGui').toggle();
						
					});
					
					$('#startExportRewards').click(function() {
						
						if (horizenRewardExporter.status == 'querying') {
							
							horizenRewardExporter.log('Queries still running.', 3);
							
						} if (horizenRewardExporter.transactions.info.length == 0) {
							
							horizenRewardExporter.log('No data yet.', 3);
							
						} else {
							
							horizenRewardExporter.transactions.filter.apply();
							horizenRewardExporter.transactions.exportRewards();
							
						}
						
					});
					
					$('#startExportRaw').click(function() {
						
						if (horizenRewardExporter.status == 'querying') {
							
							horizenRewardExporter.log('Queries still running.', 3);
							
						} if (horizenRewardExporter.transactions.info.length == 0) {
							
							horizenRewardExporter.log('No data yet.', 3);
							
						} else {
							
							horizenRewardExporter.transactions.exportRawTas();
							
						}
						
					});
					
					$('#Hrte_start_button').click(function() {
						
						if (horizenRewardExporter.status == '') {
							
							$(this).attr('disabled', true);
							$('#loaderImg').fadeIn();
						
							horizenRewardExporter.status = 'querying';
						
							horizenRewardExporter.transactions.get();
							
							$('#filterCointainer').addClass('hidden');
							
						} else {
						
							horizenRewardExporter.log('Queries still running.', 3);
						
						}
						
					});
					
					$('#contactDeveloper').click(function() {
						
						location.href = 'mailto:flueschpluesch@gmail.com';
						
					});
					
					$('#Hrte_reset_button').click(function() {
						
						horizenRewardExporter.reset();
						
					});
					
					var checkboxValues = localStorage.getItem('checkboxValues');
					
					if (checkboxValues) checkboxValues = JSON.parse(checkboxValues);
					
					$.each(checkboxValues, function(key, value) {
						
					  $("#" + key).prop('checked', value);
					  
					});
					
				}
				
			},
			
			reset : function(force) {
				
				if (horizenRewardExporter.status == 'querying' && force !== true) {
							
					horizenRewardExporter.log('Queries still running.', 3);
					
				} else {
					
					$('#filterCointainer').addClass('hidden');
					
					horizenRewardExporter.transactions.receivedTotal = 0;
					
					horizenRewardExporter.transactions.raw = [];
					
					horizenRewardExporter.transactions.pagesTotal = 0;
					horizenRewardExporter.transactions.currentPage = 0;
					
					$('#startDate').datepicker('destroy');
					$('#endDate').datepicker('destroy');
					
					$('#rewardAddresses').val(horizenRewardExporter.rewardAddresses);
					
					horizenRewardExporter.transactions.cache = 0;
					
					horizenRewardExporter.transactions.info = [];
					
					$('#HTC-Output, #pagesGui').html('');
					
					$('#Hrte_start_button').attr('disabled', false);
					$('#loaderImg').fadeOut();
					
				}
				
			},
		
			getAddress : function() {
					
				return window.location.pathname.split("/").pop();
				
			}
				
		}
		
		
		$(document).ready(function(){
			
			//Insert GUI and Button
			setInterval(function() {
				
				if (!$('#downloadTransactionsButton').length && $('#wrap > section > section > div:nth-child(4) > h2').length) {
					
					if (!$('#horizenRewardExporterGui').length) {
							
						horizenRewardExporter.gui.insert();
						console.log('GUI inserted.');
						
						$('#search').focus(function() {
							
							$('#horizenRewardExporterGui').hide();
							
						});
						
					}
					
					$('<button id="downloadTransactionsButton" type="button">Download all rewards/transactions</button>').click(function() {
						
						var newAddress = horizenRewardExporter.getAddress();
						
						if (newAddress != horizenRewardExporter.address) {
							
							horizenRewardExporter.reset(true);
							
							horizenRewardExporter.address = horizenRewardExporter.getAddress();
							$('#HrteAddressField').html(horizenRewardExporter.address);
							
						}
						
						$('#horizenRewardExporterGui').toggle();
						
					}).insertAfter('#wrap > section > section > div:nth-child(4) > h2');
					
					console.log('Button inserted.');
					
				}
				
			}, 100);
			
		});
		
	} else {
		
		console.log('Code already injected!');
		
	}

})();