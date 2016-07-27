
// CSS
import styles from './style.css';

import React, { Component } from 'react';

import * as values from '../../../constants/DefaultValues';
import Mixins from '../../../mixins/global';
import Item from '../Item';

class Pagination extends Component {

    constructor() {
        super();
        this._onAddQueClick = this._onAddQueClick.bind(this);
        this._onEditPageClick = this._onEditPageClick.bind(this);
    }

    render() {
        const { id, data, editPage } = this.props;
        const list = [];
        data.question.forEach((question, idx) => {
            list.push(this._renderQuestion(question, idx));
        });
        const description = editPage.page === data.page ? editPage.description : data.description;

        return (
            <div className={styles.page}>
                <div className={styles.header}>
                    <div className={styles.title}>Page {id}:{description}</div>
                    <div className={styles.control}>
                        <button
                            data-type="text"
                            className={`${styles.btn} btn`}
                            onClick={this._onEditPageClick}
                        >
                            Edit
                        </button>
                        <button
                            data-type="order"
                            className={`${styles.btn} btn`}
                            onClick={this._onEditPageClick}
                        >
                            Order
                        </button>
                        <button
                            data-type="copy"
                            className={`${styles.btn} btn`}
                            onClick={this._onEditPageClick}
                        >
                            Copy
                        </button>
                        <button
                            data-type="delete"
                            className={`${styles.btn} btn`}
                            onClick={this._onEditPageClick}
                        >
                            Delete
                        </button>
                    </div>
                </div>
                <div className={styles.box}>
                    {list}
                    <button className={styles.addBtn} onClick={this._onAddQueClick}>
                        + Add Question
                    </button>
                </div>
            </div>
        );
    }

    _renderQuestion(question, idx) {
        const { data, editQuestion, questionsActions,
            editQuestionActions, moveQuestion, getQuestion } = this.props;
        const requiredProps = {
            key: idx,
            idx,
            page: data.page,
            data: question,
            editQuestion,
            questionsActions,
            editQuestionActions,
            moveQuestion,
            getQuestion
        };
        return (<Item {...requiredProps} />);
    }

    _onAddQueClick() {
        const { data, questionsActions } = this.props;
        const question = {
            id: Mixins.generateQuestionID(),
            type: 'radio',
            label: values.QUESTION_TITLE,
            data: [
                { value: '1', label: values.OPTION_TITLE }
            ],
            required: true
        };
        questionsActions.addQuestion(data.page, question);
        // save Question
        questionsActions.saveQuestion();
    }

    _onEditPageClick(e) {
        if (e.target.getAttribute('data-type') === 'order') {
            const { questions, orderPageActions } = this.props;
            const orderPage = [];
            questions.forEach((page) => {
                orderPage.push(page.page);
            });
            orderPageActions.setOrderPage(orderPage);
        } else if (e.target.getAttribute('data-type') === 'copy') {
            const { data, questionsActions } = this.props;
            questionsActions.copyPage(data.page);
            // save Question
            questionsActions.saveQuestion();
        } else if (e.target.getAttribute('data-type') === 'text') {
            const { data, editPageActions } = this.props;
            editPageActions.setEditPage({ page: data.page, description: data.description });
        } else if (e.target.getAttribute('data-type') === 'delete') {
            const { data, questionsActions } = this.props;
            questionsActions.deletePage(data.page);
            // save Question
            questionsActions.saveQuestion();
        }
    }

}

export default Pagination;
