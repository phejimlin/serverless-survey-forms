/**
 * @module Feedback
 * Feedback form component
 * Will handle form components render according to data
 *
 **/
import styles from './style.css';

import React from 'react';
import PureComponent from 'react-pure-render/component';

import Checkbox from '../Checkbox';
import Radio from '../Radio';
import Select from '../Select';
import Text from '../Text';
import Textarea from '../Textarea';
import Rating from '../Rating';
import Privacy from '../Privacy';
import Pagination from '../Pagination';

class Feedback extends PureComponent {

    constructor(props) {
        super(props);
        this._renderPreview = this._renderPreview.bind(this);
        this._renderEmbedded = this._renderEmbedded.bind(this);
        this._renderThankyou = this._renderThankyou.bind(this);
        this._onChangeHandle = this._onChangeHandle.bind(this);
    }

    render() {
        const { settings, done } = this.props;
        let feedbackView;
        if (settings.type === 'preview') {
            feedbackView = this._renderPreview();
        } else {
            feedbackView = this._renderEmbedded();
        }
        return (
            <div ref="root">
                {done ? this._renderThankyou() : feedbackView}
            </div>
        );
    }

    _renderEmbedded() {
        const { settings, paging, surveyActions, feedbackActions } = this.props;
        const { subject, content } = this.props.survey;

        const currentPageContent = content[paging - 1];
        const { description, question } = currentPageContent;
        const list = question.map(
            (itm, idx) => this._renderQuestion(itm, idx));
        return (
            <div className={styles.wrap}>
                <div className={styles.header}>
                    <h1>{subject}</h1>
                </div>
                <div className={styles.container}>
                    <div className={styles.contentScroll}>
                        <div className={styles.content}>
                        {
                            description ?
                                <div className={styles.description}>{description}</div> :
                                ''
                        }
                            <div>{list}</div>
                        </div>
                    </div>
                    {
                    content.length > 1 ?
                        <Pagination
                            pages={content.length}
                            currentPage={paging}
                            surveyActions={surveyActions}
                            feedbackActions={feedbackActions}
                            settings={settings}
                        /> :
                        ''
                    }
                </div>
            </div>
        );
    }

    _renderPreview() {
        const { settings, paging, survey, surveyActions, feedbackActions } = this.props;
        const { subject, content } = survey;

        const currentPageContent = content[paging - 1];
        const { description, question } = currentPageContent;
        const list = question.map(
            (itm, idx) => this._renderQuestion(itm, idx));
        return (
            <div className={styles.wrapPreview}>
                <div className={styles.header}>
                    <h1>{subject}</h1>
                </div>
                <div className={styles.container}>
                    <div className={styles.contentScrollPreview}>
                        <div className={styles.content}>
                        {
                            description ?
                                <div className={styles.description}>{description}</div> :
                                ''
                        }
                            <div className={styles.feedbackPreview}>{list}</div>
                        </div>
                    </div>

                </div>
                {
                    content.length > 1 ?
                        <div className={styles.paginationPreview}>
                            <Pagination
                                pages={content.length}
                                currentPage={paging}
                                surveyActions={surveyActions}
                                feedbackActions={feedbackActions}
                                settings={settings}
                            />
                        </div> : ''
                }
            </div>
        );
    }

    _renderQuestion(item, idx) {
        const requiredProps = {
            id: idx + 1,
            key: idx,
            item: item,
            onChangeHandle: this._onChangeHandle
        };
        switch (item.type) {
        case 'radio':
            return (<Radio {...requiredProps} />);
        case 'checkbox':
            return (<Checkbox {...requiredProps} />);
        case 'text':
            return (<Text {...requiredProps} />);
        case 'textarea':
            return (<Textarea {...requiredProps} />);
        case 'select':
            return (<Select {...requiredProps} />);
        case 'scale':
            return (<Rating {...requiredProps} />);
        default:
            return (<div key={idx + 1}>Can't find the survey component: {item.type}</div>);
        }
    }

    _renderThankyou() {
        const { subject } = this.props.survey;
        const { description, privacy } = this.props.survey.thankyou;
        return (
            <div
                className={
                    this.props.settings.type === 'preview' ?
                        styles.wrapPreview : styles.wrap}
            >
                <div className={styles.header}>
                    <h1>{subject}</h1>
                </div>
                <div className={styles.container}>
                    <div
                        className={
                            this.props.settings.type === 'preview' ?
                                styles.contentScrollPreview : styles.contentScroll}
                    >
                        <div className={styles.content}>
                        {
                            description ?
                                <div className={styles.description}>{description}</div> :
                                ''
                        }
                            <div
                                className={
                                    this.props.settings.type === 'preview' ?
                                    styles.feedbackPreview : ''}
                            >
                                <Privacy info={privacy} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    _onChangeHandle(feedback) {
        // Add feedback to store
        this.props.feedbackActions.recordFeedback(feedback);
    }
}

export default Feedback;
