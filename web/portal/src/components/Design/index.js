
// CSS
import './style.css';

import React from 'react';
import PureComponent from 'react-pure-render/component';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import PageBtn from '../PageBtn';
import EditQuestion from '../EditPanel/EditQuestion';
import OrderPage from '../EditPanel/OrderPage';
import EditPage from '../EditPanel/EditPage';
import Pagination from '../Form/Pagination';

class Design extends PureComponent {

    constructor(props) {
        super(props);
        this._moveQuestion = this._moveQuestion.bind(this);
        this._getQuestion = this._getQuestion.bind(this);

        // init questionnaire
        const { questions, questionsActions } = props;
        const page = questions.length + 1;
        questionsActions.addPage(page);
    }

    render() {
        const { questions, questionsActions } = this.props;
        const ctrlProps = {
            questions,
            questionsActions
        };

        return (
            <div ref="root">
                {this._renderEdit()}
                {this._renderPage()}
                <PageBtn {...ctrlProps} />

                <div style={{ width: '100%', margin: '10px 0', textAlign: 'center' }}>
                    Thank you page
                </div>
            </div>
        );
    }

    _renderPage() {
        const { questions, editQuestion, editPage, orderPage,
            questionsActions, editQuestionActions, editPageActions, orderPageActions } = this.props;
        const basicProps = {
            questions,
            editQuestion,
            editPage,
            questionsActions,
            editQuestionActions,
            editPageActions,
            orderPageActions,
            moveQuestion: this._moveQuestion,
            getQuestion: this._getQuestion
        };
        const pageList = [];
        if (orderPage.length > 0) {
            orderPage.forEach((pageNum, idx) => {
                const page = questions[pageNum - 1];
                const pros = Object.assign({}, basicProps,
                    {
                        key: idx,
                        id: idx + 1,
                        data: page
                    });
                pageList.push(<Pagination {...pros} />);
            });
        } else {
            questions.forEach((page, idx) => {
                const pros = Object.assign({}, basicProps,
                    {
                        key: idx,
                        id: idx + 1,
                        data: page
                    });
                pageList.push(<Pagination {...pros} />);
            });
        }
        return pageList;
    }

    _renderEdit() {
        const { questions,
                editQuestion,
                editPage,
                orderPage,
                questionsActions,
                editQuestionActions,
                editPageActions,
                orderPageActions } = this.props;

        if (editQuestion.hasOwnProperty('id') && editQuestion.id !== '') {
            const editProps = {
                editQuestion,
                editQuestionActions,
                questionsActions
            };
            return (<EditQuestion {...editProps} />);
        } else if (orderPage.length > 0) {
            const editProps = {
                questions,
                orderPage,
                orderPageActions,
                questionsActions
            };
            return (<OrderPage {...editProps} />);
        } else if (editPage.hasOwnProperty('page') && editPage.page > 0) {
            const editProps = {
                editPage,
                editPageActions,
                questionsActions
            };
            return (<EditPage {...editProps} />);
        }
        return '';
    }

    _moveQuestion(id, aftPage, aftIndex) {
        const { questionsActions } = this.props;
        const { question, page, index } = this._getQuestion(id);
        if (index !== aftIndex || page !== aftPage) {
            questionsActions.exchangeQuestion(page, index, aftPage, aftIndex, question);
        }
    }

    _getQuestion(id) {
        const { questions } = this.props;
        let page;
        let index;
        let question;
        let flag = false;
        for (const obj of questions) {
            for (const que of obj.question) {
                if (que.id === id) {
                    question = que;
                    page = obj.page;
                    index = obj.question.indexOf(question);

                    flag = true;
                    break;
                }
            }
            if (flag) break;
        }
        return {
            question,
            page,
            index
        };
    }
}

export default DragDropContext(HTML5Backend)(Design);
