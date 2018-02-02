$(document).ready(function(){
  //Limit input field to only allow numbers and colon. I changed this into a function as to allow recursion. It was not being applied to our cloned fields.
  //By calling to our function below, it then gets applied.
const numOnly = ()=>{
    $(".numOnly").alphanum({
      allow              : ':',
      disallow           : 'xyz',
      allowSpace         : false,
      allowNumeric       : true,
      allowUpper         : false,
      allowLower         : false,
      allowCaseless      : true,
      allowLatin         : true,
      allowOtherCharSets : true,
      forceUpper         : false,
      forceLower         : false,
      maxLength          : NaN
    });
  }
  numOnly();

  let meetEventIndex = 0,
      appendCount = 0;

  //We create a click function to add additional fields if an additional meeting is needed. It will also reveal the Remove button. Adds one to our counter each time
  $('#add').click(() => {
    meetEventIndex++;
        //When adding additional fields we look at the meetEventBody div and clone and append our cloned fields after the original field. We clear its contnets (if any) and change its id. We call back to our numOnly function to ensure only numbers and colon are accepted in our fields.
    $("#meetEventBody").after($("#meetEventBody").clone().find("input:text").val("").end().attr("id", "meetEventBody" + meetEventIndex));
    $("#remove").removeClass("hidden");
    numOnly();
  });

  //A click function to remove an additional fields we've added. This decrements our counter, and if counter = 0 we remove the remove button
  $("#remove").click(() => {
    $("#meetEventBody" + meetEventIndex).remove();
    meetEventIndex--;
    if(meetEventIndex == 0){
      $('#remove').addClass("hidden");
    }
  })
$('#meetEvent').submit(function(e){
  e.preventDefault();
    var formData = $(this).serializeObject();
    console.log(formData);
    //Create a loop for the purpose of testing our time inputs to verify that they contain a colon as well as formatted in 12 hour time instead of 24 hour time
    for (var j = 0; j < formData.startTime.length; j++){
      var splitStart = formData.startTime[j].split('');
      var splitEnd = formData.endTime[j].split('');
      if (formData.startTime[j].length == 5){
        if(splitStart[0] == 0 || splitStart[1] > 2){
          alert ("Invalid input. Please input in 12 hour time (i.e 12:30 or 3:00)");
          return false;
        }
      }
      if (formData.startTime[j][1] != ':' && formData.startTime[j][2] != ':'){
        alert ("Invalid input. Please include a colon (:) within your time.");
        return false;
      }
      if(formData.endTime[j].length == 5){
        if(splitEnd[0] == 0 || splitEnd[1] > 2){
          alert ("Invalid input. Please input in 12 hour time (i.e 12:30 or 3:00)");
          return false;
        }
      }
      if (formData.endTime[j][1] != ':' && formData.endTime[j][2] != ':'){
        alert ("Invalid input. Please include a colon (:) within your time.");
        return false;
      }
    }
    console.log("Validation complete");

    $.ajax({
      method: "POST",
      url: "/createEvents",
      data: formData
    })

  })
})
