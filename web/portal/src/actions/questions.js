
import * as types from '../constants/ActionTypes';
import * as values from '../constants/DefaultValues';

// import { push } from 'react-router-redux';
import fetch from 'isomorphic-fetch';
import Config from '../config';
import Mixins from '../mixins/global';
import { setSubject } from './subject';

export function setSurveyID(data) {
    return {
        type: types.SET_SURVEYID,
        surveyID: data
    };
}

export function finishEdit() {
    return (dispatch) => {
        dispatch(setSurveyID(''));
        dispatch(setSubject(''));
        dispatch({ type: types.INIT_QUESTIONS });
        dispatch({ type: types.INIT_SURVEY_POLICY });
        // TODOS: temporarily remove router
        // dispatch(push('/'));
    };
}

export function addQuestion(page, data) {
    return (dispatch, getState) => {
        const pageIdx = page - 1;
        const newQuestions = [...getState().questions];
        // if this page already existed, edit this page content
        // object and array need copy reference
        const pageData = Object.assign({}, newQuestions[pageIdx]);
        pageData.question = [...pageData.question];
        pageData.question.push(data);
        newQuestions[pageIdx] = pageData;

        dispatch({
            type: types.ADD_QUESTION,
            questions: newQuestions
        });
    };
}

export function updateQuestionItem() {
    return (dispatch, getState) => {
        const { questions, editQuestion } = getState();
        const newQuestions = [];
        for (const obj of questions) {
            const newPages = Object.assign({}, obj);
            newPages.question = [];
            for (const que of obj.question) {
                let newItems = Object.assign({}, que);
                if (que.id === editQuestion.id) {
                    newItems = Object.assign(newItems, editQuestion);
                    if (!editQuestion.hasOwnProperty('input')) {
                        delete newItems.input;
                    }
                }
                newPages.question.push(newItems);
            }
            newQuestions.push(newPages);
        }

        dispatch({
            type: types.EDIT_QUESTION,
            questions: newQuestions
        });
    };
}

export function copyQuestion(page, queId) {
    return (dispatch, getState) => {
        const { questions } = getState();
        const pageIdx = page - 1;
        const newQuestions = [...questions];
        const duplicateQue = Object.assign({}, newQuestions[pageIdx].question[queId],
            { id: Mixins.generateQuestionID() });
        newQuestions[pageIdx] = Object.assign({}, questions[pageIdx]);
        newQuestions[pageIdx].question = [...questions[pageIdx].question];
        newQuestions[pageIdx].question.splice(queId, 0, duplicateQue);

        dispatch({
            type: types.COPY_QUESTION,
            questions: newQuestions
        });
    };
}

export function deleteQuestion(page, queId) {
    return (dispatch, getState) => {
        const { questions } = getState();
        const pageIdx = page - 1;
        const newQuestions = [...questions];
        newQuestions[pageIdx] = Object.assign({}, questions[pageIdx]);
        newQuestions[pageIdx].question = [...questions[pageIdx].question];
        newQuestions[pageIdx].question.splice(queId, 1);

        dispatch({
            type: types.DELETE_QUESTION,
            questions: newQuestions
        });
    };
}

export function exchangeQuestion(bfPage, bfIdx, afPage, afIdx, data) {
    return (dispatch, getState) => {
        const { questions } = getState();
        const newQuestions = [];
        if (bfPage !== afPage) {
            for (const obj of questions) {
                const newPages = Object.assign({}, obj);
                newPages.question = [...obj.question];
                if (obj.page === bfPage) {
                    newPages.question.splice(bfIdx, 1);
                } else if (obj.page === afPage) {
                    newPages.question.splice(afIdx, 0, data);
                }
                newQuestions.push(newPages);
            }
        } else {
            for (const obj of questions) {
                const newPages = Object.assign({}, obj);
                newPages.question = [...obj.question];
                if (obj.page === afPage) {
                    newPages.question.splice(bfIdx, 1);
                    newPages.question.splice(afIdx, 0, data);
                }
                newQuestions.push(newPages);
            }
        }

        dispatch({
            type: types.EXCHANGE_QUESTION,
            questions: newQuestions
        });
    };
}

export function addPage(page) {
    const newPage = {
        page: page,
        description: values.PAGE_TITLE,
        question: []
    };

    return {
        type: types.ADD_PAGE,
        page: newPage
    };
}

export function copyPage(pageId) {
    return (dispatch, getState) => {
        const newQuestions = [...getState().questions];
        const originPage = newQuestions[pageId - 1];
        const duplicateQues = [];
        for (const que of originPage.question) {
            // regenerate question id
            duplicateQues.push(Object.assign({}, que, { id: Mixins.generateQuestionID() }));
        }
        newQuestions.splice(pageId, 0, Object.assign({}, originPage, { question: duplicateQues }));
        newQuestions.forEach((page, idx) => {
            Object.assign(page, { page: idx + 1 });
        });

        dispatch({
            type: types.COPY_PAGE,
            questions: newQuestions
        });
    };
}

export function editPageTitle() {
    return (dispatch, getState) => {
        const { page, description } = getState().editPage;
        const newQuestions = [...getState().questions];
        newQuestions[page - 1] = Object.assign({}, newQuestions[page - 1],
            { description: description });

        dispatch({
            type: types.EDIT_PAGE_TITLE,
            questions: newQuestions
        });
    };
}

export function deletePage(pageId) {
    return (dispatch, getState) => {
        const newQuestions = [...getState().questions];
        newQuestions.splice(pageId - 1, 1);
        newQuestions.forEach((page, idx) => {
            Object.assign(page, { page: idx + 1 });
        });

        dispatch({
            type: types.DELETE_PAGE,
            questions: newQuestions
        });
    };
}

export function exchangePage() {
    return (dispatch, getState) => {
        const { questions, orderPage } = getState();
        const newQuestions = [];
        orderPage.forEach((pageNum, idx) => {
            const page = Object.assign({}, questions[pageNum - 1]);
            page.page = idx + 1;
            newQuestions.push(page);
        });

        dispatch({
            type: types.EXCHANGE_PAGE,
            questions: newQuestions
        });
    };
}

function saveQuestionsSuccess() {
    return {
        type: types.SAVE_QUESTIONS_SUCCESS
    };
}

function saveQuestionsFailure(err) {
    return {
        type: types.SAVE_QUESTIONS_FAILURE,
        errorMsg: err
    };
}

export function saveQuestion() {
    return (dispatch, getState) => {
        const { account, surveyID, subject, questions, surveyPolicy, token } = getState();
        const postData = {
            subject: subject,
            survey: { content: [...questions], thankyou: surveyPolicy }
        };

        return fetch(`${Config.baseURL}/api/v1/mgnt/surveys/${account.accountid}/${surveyID}`, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                authorization: token
            },
            body: JSON.stringify(postData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.datetime) {
                dispatch(saveQuestionsSuccess());
            } else {
                dispatch(saveQuestionsFailure(data));
            }
        })
        .catch(err => saveQuestionsFailure(err.responseJSON));
    };
}

function setSurveyPolicy(data) {
    return {
        type: types.SET_SURVEY_POLICY,
        surveyPolicy: data
    };
}

export function editSurveyPolicy(flag) {
    const data = Object.assign({},
        {
            description: 'Thanks for sharing your feedback with Trend Micro.',
            privacy: {}
        });

    if (flag) {
        const label = 'If Trend Micro has a follow-up survey on the Email Scan,'
            + ' would you like to participate?';
        const privacy = {
            label: label,
            terms: 'Yes, Trend Micro can reach me at this address: ',
            input: 'Please enter your email address.'
        };
        data.privacy = privacy;
    }

    return (dispatch) => {
        dispatch(setSurveyPolicy(data));
        return dispatch(saveQuestion());
    };
}

function receiveQuestionsSuccess(data) {
    return {
        type: types.RECIEVE_QUESTIONS_SUCCESS,
        questions: data
    };
}

function receiveQuestionsFailure(err) {
    return {
        type: types.RECIEVE_QUESTIONS_FAILURE,
        errorMsg: err
    };
}

export function getQuestion(surveyID) {
    return (dispatch, getState) => {
        const { account } = getState();

        return fetch(`${Config.baseURL}/api/v1/surveys/${account.accountid}/${surveyID}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Cache-Control': 'max-age=0'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.surveyid) {
                dispatch(setSurveyID(data.surveyid));
                dispatch(setSubject(data.subject));
                dispatch(receiveQuestionsSuccess(data.survey.content));
                dispatch(setSurveyPolicy(data.survey.thankyou));
                // TODOS: temporarily remove router
                // dispatch(push('/create'));
            } else {
                dispatch(receiveQuestionsFailure(data));
            }
        })
        .catch(err => receiveQuestionsFailure(err.responseJSON));
    };
}
