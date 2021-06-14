const {google} = require( "googleapis" );

const keys = require( "./spreadsheetreader-316808-43fe442f13ce.json" );



const client = new google.auth.JWT(

      keys.client_email

    , null

    , keys.private_key

    , [ 'https://www.googleapis.com/auth/spreadsheets' ]  // 사용자 시트 및 해당 속성에 대한 읽기/쓰기 액세스 허용

);



client.authorize( function( err, tokens ) {



    if( err ) {

        console.log( err );

        return;

    } else {

        gsrun( client );

    }

});



async function gsrun( client ) {



    const sheets = google.sheets( { version : "v4", auth : client } );



    const request = {

          spreadsheetId : "https://docs.google.com/spreadsheets/d/1gJsdW120PRzu1143cPSqTW-GuUWUrMW-M_P2mu3lCzg/edit?usp=sharing"

        , range : "모의고사 회차별 시트"

    };



    const response = ( await sheets.spreadsheets.values.get( request ) ).data;

    const responseArray = response.values;



    // console.log( responseArray );



    // @see LAST NAME과 FIRST NAME을 합친다

    let realNames = new Array();

    responseArray.map( function( val ) {

        realNames.push( val[2] + " " + val[3] );

        return realNames;

    });



    console.log( realNames );

}