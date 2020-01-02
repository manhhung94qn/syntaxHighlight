// var strReg1 = /"(.*?)"/g,
//     strReg2 = /'(.*?)'/g,
    //specialReg = /\b(new|var|let|const|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g,
    // specialJsGlobReg = /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g,
    // specialJsReg = /\b(getElementsBy(TagName|ClassName|Name)|getElementById|typeof|instanceof)(?=[^\w])/g,
    // specialMethReg = /\b(indexOf|match|toString|length)(?=[^\w])/g,
    // specialPhpReg  = /\b(define|echo|print_r|var_dump)(?=[^\w])/g,
    // specialCommentReg  = /(\/\*.*\*\/)/g,
    // inlineCommentReg = /(\/\/.*)/g;
let t1 = Date.now();

const 
    // string with formath "something"
    strStringJs1Reg = /"(.*?)"/g,
    //String has format: 'something'
    strStringJs2Reg = /'(.*?)'/g,
    // comment in a line, ex: //something
    strInlineCommentReg = /(\/\/.*)/g,
    // Comment in multiple rows
    strMultiCommentReg  = /(\/\*(.|\n)*\*\/)/g,
    // Teamplate string
    strStringTeamplateReg = /`(\w|\W)*`/g,
    // Regex strings, ex: /something/
    strRegexrReg = /\/.*\/(g|s|u|m|i|y){0,6}(?=[\;\,\ \.])/g,
    // Key arguments|const|let|var|function|false|true|of|in 
    strKeywordJs1Reg = /\b(arguments|const|let|var|function|false|true|of|in)(?=[ ])/g,
    // Key break|case|catch|do|while|else|finally|for
    strKeywordJs2Reg = /\b(break|case|catch|do|while|else|finally|for)(?=[ ])/g,
    // Key RegExp|String
    strKeywordJs3Reg = /\b(RegExp|String|Date|Number|Boolean|Boolean|Object|Map|Promise)(?!\w)/g,
    // Class name, it is not perfect, Ex: class className { =>$1:class ;$2:className;$3: {
    strClassNameReg = /(?=(?:(new |class )).*)(?:\1)(\w*)((?:\ )?(?:\=|\{|\())/g,
    //Function exc, ex: functionName()
    strFunctionExcReg = /\w+(?=\()/g,
    //String Operater
    strOperationReg = /[\+\-\*\:\.\(\)\{\}\!\,\;]/g;





//var htmlTagReg = /(&lt;[^\&]*&gt;)/g;

var sqlReg = /\b(CREATE|ALL|DATABASE|TABLE|GRANT|PRIVILEGES|IDENTIFIED|FLUSH|SELECT|UPDATE|DELETE|INSERT|FROM|WHERE|ORDER|BY|GROUP|LIMIT|INNER|OUTER|AS|ON|COUNT|CASE|TO|IF|WHEN|BETWEEN|AND|OR)(?=[^\w])/g;

var list = document.querySelectorAll('.codeElements');
for (const item of list) {
    let parsed = item.innerHTML;

    //Endcoder
    //List string has format: "something"
    let listStringType1 = parsed.match(strStringJs1Reg)||[];
    parsed = parsed.replace(strStringJs1Reg,'@@_S_t_r_i_n_g_T_y_p_e_1_@@');

    //list string has format: 'something'
    let listStringType2 = parsed.match(strStringJs1Reg)||[];
    parsed = parsed.replace(strStringJs2Reg,'@@_S_t_r_i_n_g_T_y_p_e_2_@@');

    //List comment in a line
    let listCommentInline = parsed.match(strInlineCommentReg)||[]; 
    parsed = parsed.replace(strInlineCommentReg,'@@_C_o_m_m_e_n_t_I_n_l_i_n_e_@@');

    //List comment multiple line
    let listCommentMulti = parsed.match(strMultiCommentReg)||[]; 
    parsed = parsed.replace(strMultiCommentReg,'@@_C_o_m_m_e_n_t_M_u_l_t_i_@@');

    //list Regex strings, ex: /something/
    let listRegexr = parsed.match(strRegexrReg)||[];
    parsed = parsed.replace(strRegexrReg,'@@_R_e_g_e_x_r_@@');

    //List teamplate string, ex: `something`
    let listTeamplateString = parsed.match(strStringTeamplateReg)||[];
    parsed = parsed.replace(strStringTeamplateReg,'@@_S_t_r_i_n_g_T_e_a_m_p_l_a_t_e_@@');

    //List Key arguments|const|let|var|function|false|true|of|in 
    let listKeywordJs1 = parsed.match(strKeywordJs1Reg)||[];
    parsed = parsed.replace(strKeywordJs1Reg,'@@_K_e_y_w_o_r_d_J_s_1_@@');

    //List Key break|case|catch|do|while|else|finally|for
    let listKeywordJs2 = parsed.match(strKeywordJs2Reg)||[];
    parsed = parsed.replace(strKeywordJs2Reg,'@@_K_e_y_w_o_r_d_J_s_2_@@');
    
    //List class name
    let listClassNamePre = parsed.match(strClassNameReg)||[];
    let listClassName = listClassNamePre
                            .map(x=>x
                                .replace(/(new |class )/,"")
                                .replace(/\ ?\(|\ ?{/,"")
                            );
    parsed = parsed.replace(strClassNameReg,"$1@@_C_l_a_s_s_N_a_m_e_@@$3");

    //List RegExp|String|Date|Number|Boolean|Boolean|Object|Map. They is same class name
    let listKeywordJs3 = parsed.match(strKeywordJs3Reg)||[];
    parsed = parsed.replace(strKeywordJs3Reg,'@@_K_e_y_w_o_r_d_J_s_3_@@');

    //List function exc
    let listFunctionExc = parsed.match(strFunctionExcReg);
    parsed = parsed.replace(strFunctionExcReg,"@@_F_u_n_c_t_i_o_n_E_x_c_@@");

    //List string operation
    let listOperation = parsed.match(strOperationReg);
    parsed = parsed.replace(strOperationReg,"@@_O_p_e_r_a_t_i_o_n_@");
    let listPromise = [];
    //Decoder
    //String operation
    let promiseOperation = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<100;i++){
                console.log("_O_p_e_r_a_t_i_o_n_"+i)

            }

            for (const item of listOperation) {
                console.log("_O_p_e_r_a_t_i_o_n_"+item)

                parsed = parsed.replace('@@_O_p_e_r_a_t_i_o_n_@',`<span class="O_p_e_r_a_t_i_o_n">${item}</span>`)
            };
            resolve();
        })
    });
    listPromise.push(promiseOperation);
    //Function exc
    let propmiseFunctionExc = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<10e4;i++){}
            for (const item of listFunctionExc) {
                console.log("promise2_"+item);
                parsed = parsed.replace('@@_F_u_n_c_t_i_o_n_E_x_c_@@',`<span class="F_u_n_c_t_i_o_n_E_x_c">${item}</span>`);
            };
            resolve();
        });
    });
    listPromise.push(propmiseFunctionExc);

    //RegExp|String|Date|Number|Boolean|Boolean|Object|Map. They is same class name
    let propmiseKeywordJs3 = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<10e4;i++){}

            for (const item of listKeywordJs3) {
                console.log("KeywordJs3_"+item);
                parsed = parsed.replace('@@_K_e_y_w_o_r_d_J_s_3_@@',`<span class="K_e_y_w_o_r_d_J_s_3">${item}</span>`);
            }
            resolve();
        });
    });
    listPromise.push(propmiseKeywordJs3);

    
    //RegExp|String|Date|Number|Boolean|Boolean|Object|Map. They is same class name
    let propmiseKeywordJs2 = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<10e4;i++){}

            for (const item of listKeywordJs2) {
                console.log("KeywordJs2_"+ item);
                parsed = parsed.replace('@@_K_e_y_w_o_r_d_J_s_2_@@',`<span class="K_e_y_w_o_r_d_J_s_2">${item}</span>`);
            }
            resolve();
        });
    });
    listPromise.push(propmiseKeywordJs2);


    //List Key arguments|const|let|var|function|false|true|of|in 
    let propmiseKeywordJs1 = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<10e4;i++){}

            for (const item of listKeywordJs1) {
                console.log("KeywordJs1_"+ item);
                parsed = parsed.replace('@@_K_e_y_w_o_r_d_J_s_1_@@',`<span class="K_e_y_w_o_r_d_J_s_1">${item}</span>`);
            }
            resolve();
        });
    });
    listPromise.push(propmiseKeywordJs1);

    
    //List class name
    let propmiseClassName = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i = 0; i<10e4;i++){}

            for (const item of listClassName) {
                console.log("propmiseClassName");
                parsed = parsed.replace('@@_C_l_a_s_s_N_a_m_e_@@',`<span class="C_l_a_s_s_N_a_m_e">${item}</span>`);
            }
            resolve();
        });
    });
    listPromise.push(propmiseClassName);


    //RegExp|String|Date|Number|Boolean|Boolean|Object|Map. They is same class name
    // for (const item of listTeamplateString) {
    //     parsed = parsed.replace('@@_C_l_a_s_s_N_a_m_e_@@',`<span class="C_l_a_s_s_N_a_m_e">${item}</span>`);
    // }
    //             .replace(strInlineCommentReg,'{{--cmInline--}}')
    //             .replace(strMultiCommentReg,'{{--cmMulti--}}')
    //             .replace(strStringTeamplateReg,'{{--stringTeamplate--}}')
    //             .replace(strStringJs1Reg,'<span class="stringJs">"$1"</span>')
    //             .replace(strStringJs2Reg,"<span class=\"stringJs\">'$1'</span>")
    //             .replace(strFunctionExRgx,'<span class="functionExJs">$1</span>')
    //             .replace(strKeywordJs1Rgx,'<span class="keywordJs1">$1</span>')
    //             .replace(strKeywordJs2Rgx,'<span class="keywordJs2">$1</span>')
    //             .replace(strMultiCommentReg,'<span class="commentJs">$1</span>')
    // for (const item of listCommentInline) {
    //     parsed = parsed.replace('{{--cmInline--}}',item)
    //                 .replace(strInlineCommentReg,'<span class="commentJs">$1</span>');
    // }
    // for (const item of listCommentMulti) {
    //     parsed = parsed.replace('{{--cmMulti--}}',item)
    //                 .replace(strMultiCommentReg,'<span class="commentJs">$1</span>');
    // }
    // //replace string teamplte
    // for (let item of listStringTeamplate) {
    //     const special1Reg = /\$}/g,        
    //             strStringInTeamplate = /([^\`(${.*})]*(?=\$))/g;
    //     let listSpecial1 = item.match(special1Reg)||[];
    //     item = item.replace(special1Reg,'%%==special1==%%')
    //                 .replace(strStringInTeamplate,'<span class="stringJs">$1</span>');
    //     for (const special1 of listSpecial1) {
    //         item =item.replace('%%==special1==%%','$}');
    //     }
    //     parsed = parsed.replace('{{--stringTeamplate--}}',item);
        
    // }
    Promise.all(listPromise).then(()=>{
        item.innerHTML = parsed;
    })
}
console.log(Date.now() - t1);
